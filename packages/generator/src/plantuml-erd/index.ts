import { DMMF } from '@prisma/generator-helper';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import {
  PlantUmlErdGeneratorConfigs,
  PlantUmlErdGeneratorConfigsInput,
  PlantUmlErdGeneratorConfigsSchema,
} from './types';

export class PlantUmlErdGenerator {
  config: PlantUmlErdGeneratorConfigs;
  constructor(config: PlantUmlErdGeneratorConfigsInput) {
    this.config = PlantUmlErdGeneratorConfigsSchema.parse(config);
  }

  /** filtering models and enums */
  private filter(dmmf: DMMF.Document, targetTableName: string) {
    if (!targetTableName) return dmmf;

    // target model
    const target = dmmf.datamodel.models.find(
      (e) => e.name === targetTableName,
    );
    if (!target) return dmmf;

    // enums associated with model
    const enums = target.fields
      .filter((f) => f.kind === 'enum')
      .map((f) => f.type);
    // models associated with model
    const models = target.fields
      .filter((f) => f.kind === 'object')
      .map((f) => f.type);

    const cloned: DMMF.Document = JSON.parse(JSON.stringify(dmmf));

    // filter to target enums
    cloned.datamodel.enums = cloned.datamodel.enums.filter((e) =>
      enums.includes(e.name),
    );
    // filter to target models
    cloned.datamodel.models = cloned.datamodel.models.filter(
      (e) => models.includes(e.name) || e.name === targetTableName,
    );
    return cloned;
  }

  async generate(dmmf: DMMF.Document) {
    if (this.config.debug) {
      await fs.writeFile('/tmp/example.json', JSON.stringify(dmmf, null, 2));
    }
    const results = this._generate(dmmf, 'erd');
    if (this.config.exportPerTables) {
      results.push(...this.dumpSubRelations(dmmf));
    }

    fs.mkdir(path.dirname(this.config.output), {
      recursive: true,
    });
    await fs.writeFile(this.config.output, results.join('\n'));
    if (this.config.markdownOutput) {
      const markdown = await this.dumpMarkdownTable(dmmf);
      await fs.writeFile(this.config.markdownOutput, markdown.join('\n'));
    }
  }

  private dumpSubRelations(dmmf: DMMF.Document) {
    const results: string[] = [];

    for (const model of dmmf.datamodel.models) {
      const filteredDmmf = this.filter(dmmf, model.name);
      const subPumlString = this._generate(filteredDmmf, model.name);
      results.push(...subPumlString);
    }

    return results;
  }

  private _generate(dmmf: DMMF.Document, diagramName: string) {
    const results = [`@startuml ${diagramName}`, 'skinparam linetype ortho'];

    results.push(...this.drawEnums(dmmf));

    results.push(...this.drawEntities(dmmf));

    results.push(...this.drawRelations(dmmf));

    results.push(...this.drawEnumRelations(dmmf));

    results.push('@enduml');
    return results;
  }

  private _tableName(model: DMMF.Model) {
    if (this.config.usePhysicalTableName) return model.dbName || '';
    return model.name;
  }

  private _getDefault(field: DMMF.Field) {
    const defaultValue = field.default;
    if (!defaultValue) return '';
    const validatedDefaultValue = z
      .object({ name: z.string() })
      .safeParse(defaultValue);
    if (validatedDefaultValue.success) {
      return validatedDefaultValue.data.name;
    }
    return defaultValue;
  }

  private toLink(name?: string) {
    if (!name) return '';
    return `[${name}](#${name.toLowerCase()})`;
  }

  private findParentField(
    models: DMMF.Model[],
    baseModelName: string,
    relationToField: string,
  ) {
    const results: string[] = [];
    for (const model of models) {
      const foundField = model.fields
        .filter((e) => e.relationToFields?.length)
        .find((f) => f.type === baseModelName);
      if (foundField?.relationToFields?.includes(relationToField)) {
        results.push(this._tableName(model) || '');
      }
    }
    return results;
  }

  private dumpMarkdownTable(dmmf: DMMF.Document) {
    const results: string[] = [];
    results.push(`# Tables`);
    for (const model of dmmf.datamodel.models) {
      const name = this._tableName(model);
      results.push(`- ${this.toLink(name)}`);
      if (model.documentation) {
        results.push(`  - ${model.documentation}`);
      }
    }
    results.push('');

    if (this.config.markdownIncludeERD) {
      const erd = this._generate(dmmf, 'erd');
      results.push('# ER diagram');
      results.push('```plantuml');
      results.push(...erd);
      results.push('```');
    }

    for (const model of dmmf.datamodel.models) {
      results.push(`# ${this._tableName(model)}`);
      results.push('');

      results.push('## Description');
      results.push(model.documentation || '');
      results.push('');

      results.push(`## Columns`);
      results.push('');

      const columns = [
        'Name',
        'Type',
        'Default',
        'Nullable',
        'Children',
        'Parent',
        'Comment',
        'Unique',
      ];
      const rows = model.fields
        .filter((field) => !field.relationName) //
        .map((field) => {
          const relation = this.findParentField(
            dmmf.datamodel.models,
            model.name,
            field.name,
          );

          const fromField = model.fields.find((e) =>
            e.relationFromFields?.includes(field.name),
          );
          let m: DMMF.Model | undefined = undefined;
          if (fromField) {
            const model = dmmf.datamodel.models.find(
              (e) => e.name === fromField.type,
            );
            if (model) m = model;
          }

          const column: string[] = [
            field.name,
            field.type,
            this._getDefault(field) + '',
            !field.isRequired + '',
            relation.map((r) => this.toLink(r)).join(', '),
            m ? this.toLink(this._tableName(m) || '') : '',
            field.documentation || '',
            (field.isUnique || field.isId) + '' || '',
          ];
          return column;
        });
      results.push(...this.buildMarkdownTable(columns, rows));

      if (model.uniqueIndexes.length > 0) {
        results.push('');
        results.push('# Indexes');
        results.push('');

        const indexes = this.buildMarkdownTable(
          ['columns', 'index type', 'index name'],
          model.uniqueIndexes.map((index) => [
            index.fields.join(','),
            'unique',
            index.name || '',
          ]),
        );
        if (model.uniqueIndexes.length > 0) {
          results.push(...indexes);
        }
      }

      // draw er diagram
      if (this.config.markdownIncludeERD) {
        results.push('');
        results.push('## ER diagram');
        results.push('');
        const filteredDmmf = this.filter(dmmf, model.name);
        const subPumlString = this._generate(filteredDmmf, model.name);
        results.push('```plantuml');
        results.push(...subPumlString);
        results.push('```');
      }
    }
    return results;
  }

  private buildMarkdownTable(columns: string[], rows: string[][]) {
    const results: string[] = [];
    results.push('|' + columns.join(' | ') + '|');
    results.push('|' + columns.map(() => '---').join(' | ') + '|');

    for (const column of rows) {
      results.push('|' + column.join(' | ') + '|');
    }
    return results;
  }

  private drawEnumRelations(dmmf: DMMF.Document) {
    const results: string[] = [];
    results.push(`' enum relations`);
    for (const model of dmmf.datamodel.models) {
      for (const enumRelation of model.fields.filter(
        (f) => f.kind === 'enum',
      )) {
        // continue when relation target is not exists
        const isExists = dmmf.datamodel.enums.some(
          (e) => e.name === enumRelation.type,
        );
        if (!isExists) continue;

        const lines: string[] = [];
        lines.push(model.name);
        lines.push(' ');
        lines.push('|o');
        lines.push(this.config.lineLength);
        lines.push(enumRelation.isList ? '|{' : '||');
        lines.push(' ');
        lines.push(enumRelation.type);
        results.push(lines.join(''));
      }
    }
    return results;
  }

  private drawEnums(dmmf: DMMF.Document) {
    const results: string[] = [];

    for (const e of dmmf.datamodel.enums) {
      const enumDefineline = ['enum "'];
      enumDefineline.push(e.name);
      if (e.documentation) {
        enumDefineline.push(`\\n${e.documentation}`);
      }
      enumDefineline.push(`" as ${e.name} {`);

      results.push(enumDefineline.join(''));
      for (const value of e.values) {
        const enumValueLine = ['  ', value.name];
        if (value.dbName) {
          enumValueLine.push(': ');
          enumValueLine.push(value.dbName);
        }
        results.push(enumValueLine.join(''));
      }
      results.push(`}`);
    }

    return results;
  }
  private drawEntities(dmmf: DMMF.Document) {
    const results: string[] = [];
    for (const model of dmmf.datamodel.models) {
      const name = this.config.usePhysicalTableName ? model.dbName : model.name;
      const documentation = model.documentation
        ? `\\n${model.documentation}`
        : '';
      results.push(`entity "${name}${documentation}" as ${model.name} {`);
      // is PK exists?
      const idField = model.fields.find((f) => f.isId);
      if (idField?.name) {
        results.push(
          `+ ${idField?.name} [PK] : ${idField?.type} ${
            idField?.documentation || ''
          }`,
        );
      }
      results.push('--');
      for (const field of model.fields.filter((f) => !f.isId)) {
        const line = this._buildField(field, model.fields);
        if (line) {
          results.push(`  ${line}`);
        }
      }
      results.push(`}`);
      results.push(``);
    }
    return results;
  }

  private drawRelations(dmmf: DMMF.Document) {
    const results: string[] = [];
    const manyToManyList = this._findManyToMany(dmmf.datamodel.models);

    // add relations
    results.push(`' Relations`);
    for (const model of dmmf.datamodel.models) {
      for (const field of model.fields) {
        // continue when relation target is not exists
        const isExists = dmmf.datamodel.models.some(
          (model) => model.name === field.type,
        );
        if (!isExists) continue;
        const toMany = field.isList;
        const relationName = field.relationName;
        // ignore many to many
        if (relationName && manyToManyList.includes(relationName)) {
          continue;
        }
        // draw a line from one
        for (const _ of field.relationFromFields || []) {
          results.push(
            `${model.name} ${this._buildRelationLineFromOne(
              field,
              model.fields,
            )} ${field.type}`,
          );
        }
      }
    }

    // add many to many relations
    results.push(`' ManyToMany Relations`); // comment
    for (const manyToManyRelationName of manyToManyList) {
      const model = dmmf.datamodel.models //
        .find((model) =>
          model.fields.find(
            (field) => field.relationName === manyToManyRelationName,
          ),
        );
      if (!model) continue;
      const field = model.fields.find(
        (field) => field.relationName === manyToManyRelationName,
      );
      if (!field) continue;
      results.push(
        `${model?.name} }o${this.config.lineLength}o{ ${field.type}`,
      );
    }

    return results;
  }

  private _findManyToMany(models: DMMF.Model[]) {
    const set = new Set();
    const duplicated: string[] = [];
    for (const model of models) {
      for (const field of model.fields) {
        const relationName = field.relationName;
        if (!relationName) continue;
        if (field.relationFromFields?.length) continue;

        if (set.has(relationName)) {
          duplicated.push(relationName);
        }
        set.add(relationName);
      }
    }
    return duplicated;
  }

  private _buildRelationLineFromOne(field: DMMF.Field, fields: DMMF.Field[]) {
    const strings: string[] = [];

    if (!field.relationFromFields?.length) {
      throw new Error('invalid field');
    }
    const relationFromField = field.relationFromFields[0];
    const foreignKeyField = fields.find(
      (field) => field.name === relationFromField,
    );
    if (!foreignKeyField) throw new Error('foreign key is not exists');

    // strings.push('|o');

    if (foreignKeyField.isUnique) {
      // oneToOne
      strings.push('|');
    } else {
      // oneToMany
      strings.push('}');
    }

    // minumum. zero or one
    // Default zero
    strings.push(this.config.relationMiniumOne ? '|' : 'o');

    // line
    strings.push(this.config.lineLength);

    // zero or one
    if (foreignKeyField.isRequired) {
      strings.push('||');
    } else {
      strings.push('o|');
    }
    return strings.join('');
  }

  private _buildFieldDocument(field: DMMF.Field, fields: DMMF.Field[]) {
    const result: string[] = [`${field.name}`];
    if (field.documentation && !field.documentation.includes('@')) {
      result.push(`(${field.documentation})`);
    }
    result.push(':');

    const foreignKey = fields.find((f) =>
      f.relationFromFields?.includes(field.name),
    );
    if (this.config.showUniqueKeyLabel) {
      if (field.isUnique) {
        result.push('[UK]');
      }
    }
    if (foreignKey) {
      result.push('[FK]');
      result.push(foreignKey.type);
    } else {
      result.push(field.type);
    }
    const text = result.join(' ');
    if (foreignKey) {
      // foreign key
      return `# ${text}`;
    } else if (field.isRequired) {
      // required field
      return `* ${text}`;
    }

    return text;
  }

  private _buildField(field: DMMF.Field, fields: DMMF.Field[]) {
    if (field.relationName) return undefined;

    const name = this._buildFieldDocument(field, fields);

    return name;
  }
}
