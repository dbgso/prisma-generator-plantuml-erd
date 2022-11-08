import { DMMF } from '@prisma/generator-helper';
import { promises as fs } from 'fs';
import path from 'path';
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
  }

  private dumpSubRelations(dmmf: DMMF.Document) {
    const results: string[] = [];

    for (const model of dmmf.datamodel.models) {
      const filteredDmmf = this.filter(dmmf, model.name);
      results.push(...this._generate(filteredDmmf, model.name));
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
      const idField = model.fields.find((f) => f.isId);
      const name = this.config.usePhysicalTableName ? model.dbName : model.name;
      const documentation = model.documentation
        ? `\\n${model.documentation}`
        : '';
      results.push(`entity "${name}${documentation}" as ${model.name} {`);
      results.push(
        `* ${idField?.name} [PK] : ${idField?.type} ${
          idField?.documentation || ''
        }`,
      );
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
    if (foreignKey) {
      result.push('[FK]');
      result.push(foreignKey.type);
    } else {
      result.push(field.type);
    }

    return result.join(' ');
  }

  private _buildField(field: DMMF.Field, fields: DMMF.Field[]) {
    if (field.relationName) return undefined;

    const name = this._buildFieldDocument(field, fields);

    // Required Field
    if (field.isRequired) return `**${name}**`;

    return name;
  }
}
