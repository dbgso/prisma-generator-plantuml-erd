import { DMMF } from '@prisma/generator-helper';
import { promises as fs } from 'fs';
import path from 'path';
import { AsciiDocGenerator } from './generators/asciidoc-table-definition-generator';
import { MarkdownTableDefinitionGenerator } from './generators/markdown-table-definition-generator';
import {
  PlantUmlErdGeneratorConfigs,
  PlantUmlErdGeneratorConfigsInput,
  PlantUmlErdGeneratorConfigsSchema,
} from './types';
import { createFilteredDMMFDocument } from './utils';

export class PlantUmlErdGenerator {
  config: PlantUmlErdGeneratorConfigs;
  constructor(config: PlantUmlErdGeneratorConfigsInput) {
    this.config = PlantUmlErdGeneratorConfigsSchema.parse(config);
  }

  async generate(dmmf: DMMF.Document) {
    if (this.config.debug) {
      await fs.writeFile('/tmp/example.json', JSON.stringify(dmmf, null, 2));
    }
    const results = this.generateERDiagramText(dmmf, 'erd');
    if (this.config.exportPerTables) {
      results.push(...this.dumpSubRelations(dmmf));
    }

    fs.mkdir(path.dirname(this.config.output), {
      recursive: true,
    });
    await fs.writeFile(this.config.output, results.join('\n'));
    if (this.config.markdownOutput) {
      const markdown = new MarkdownTableDefinitionGenerator(this).generate(
        dmmf,
      );
      await fs.writeFile(this.config.markdownOutput, markdown.join('\n'));
    }
    if (this.config.asciidocOutput) {
      const adocGenerator = new AsciiDocGenerator(this);
      const asciidocText = adocGenerator.generate(dmmf);
      await fs.writeFile(this.config.asciidocOutput, asciidocText.join('\n'));
    }
  }

  private dumpSubRelations(dmmf: DMMF.Document) {
    const results: string[] = [];

    for (const model of dmmf.datamodel.models) {
      const filteredDmmf = createFilteredDMMFDocument(dmmf, model.name);
      const subPumlString = this.generateERDiagramText(
        filteredDmmf,
        model.name,
      );
      results.push(...subPumlString);
    }

    return results;
  }

  generateERDiagramText(dmmf: DMMF.Document, diagramName: string) {
    const results = [`@startuml ${diagramName}`];
    if (this.config.lineType) {
      results.push(`skinparam linetype ${this.config.lineType}`);
    }
    if (this.config.isLeftToRightDirection) {
      results.push(`left to right direction`);
    }

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
        const relationName = field.relationName;
        // ignore many to many
        if (relationName && manyToManyList.includes(relationName)) {
          continue;
        }
        // draw a line from one
        // like `User }o--|| Team: team_id`
        for (const foreignKey of field.relationFromFields || []) {
          const relationLine = `${model.name} ${this._buildRelationLineFromOne(
            field,
            model.fields,
          )} ${field.type}`;
          if (this.config.showForeignKeyOnRelation) {
            results.push(`${relationLine}: ${foreignKey}`);
          } else {
            results.push(relationLine);
          }
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
