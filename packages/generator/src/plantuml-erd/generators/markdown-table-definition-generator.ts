import { DMMF } from '@prisma/generator-helper';
import { PlantUmlErdGenerator } from '..';
import {
  createFilteredDMMFDocument,
  createTableName,
  findParentField,
  getDefault,
} from '../utils';

export class MarkdownTableDefinitionGenerator {
  constructor(private generator: PlantUmlErdGenerator) {}

  generate(dmmf: DMMF.Document) {
    const results: string[] = [];
    results.push(`# Tables`);
    for (const model of dmmf.datamodel.models) {
      const name = createTableName(
        model,
        this.generator.config.usePhysicalTableName,
      );
      results.push(`- ${this.toLink(name)}`);
      if (model.documentation) {
        results.push(`  - ${model.documentation}`);
      }
    }
    results.push('');

    if (this.generator.config.markdownIncludeERD) {
      const erd = this.generator.generateERDiagramText(dmmf, 'erd');
      results.push('# ER diagram');
      results.push('```plantuml');
      results.push(...erd);
      results.push('```');
    }

    for (const model of dmmf.datamodel.models) {
      results.push(
        `# ${createTableName(
          model,
          this.generator.config.usePhysicalTableName,
        )}`,
      );
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
        'Unique',
        'Children',
        'Parent',
        'Comment',
      ];
      const rows = model.fields
        .filter((field) => !field.relationName) //
        .map((field) => {
          const relation = findParentField(
            dmmf.datamodel.models,
            model.name,
            field.name,
            this.generator.config.usePhysicalTableName,
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
            getDefault(field) + '',
            !field.isRequired + '',
            (field.isUnique || field.isId) + '' || '',
            relation.map((r) => this.toLink(r)).join(', '),
            m
              ? this.toLink(
                  createTableName(
                    m,
                    this.generator.config.usePhysicalTableName,
                  ) || '',
                )
              : '',
            field.documentation || '',
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
      if (this.generator.config.markdownIncludeERD) {
        results.push('');
        results.push('## ER diagram');
        results.push('');
        const filteredDmmf = createFilteredDMMFDocument(dmmf, model.name);
        const subPumlString = this.generator.generateERDiagramText(
          filteredDmmf,
          model.name,
        );
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

  private toLink(name?: string) {
    if (!name) return '';
    return `[${name}](#${name.toLowerCase()})`;
  }
}
