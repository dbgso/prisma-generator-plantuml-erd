import { DMMF } from '@prisma/generator-helper';
import { promises as fs } from 'fs';
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

  async generate(dmmf: DMMF.Document) {
    if (this.config.debug) {
      await fs.writeFile('/tmp/example.json', JSON.stringify(dmmf, null, 2));
    }
    const results = ['@startuml example', 'skinparam linetype ortho'];

    results.push(...this.drawEntities(dmmf));

    results.push(...this.drawRelations(dmmf));

    results.push('@enduml');

    await fs.writeFile(this.config.output, results.join('\n'));
  }

  private drawEntities(dmmf: DMMF.Document) {
    const results: string[] = [];
    for (const model of dmmf.datamodel.models) {
      const idField = model.fields.find((f) => f.isId);
      const name = this.config.usePhysicalTableName ? model.dbName : model.name;
      const documentation = `\\n${
        model.documentation ? model.documentation : ''
      }`;
      results.push(`entity "${name} ${documentation}" as ${model.name} {`);
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
