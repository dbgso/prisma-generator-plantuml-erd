import { DMMF } from '@prisma/generator-helper';
import { PlantUmlErdGenerator } from '..';
import {
  createFilteredDMMFDocument,
  createTableName,
  doubleQuote,
  findParentField,
  getDefault,
} from '../utils';

export class AsciiDocGenerator {
  constructor(private generator: PlantUmlErdGenerator) {}
  public generate(dmmf: DMMF.Document) {
    const results: string[] = [`:toc: left`, `:nofooter:`];

    // ER図
    const erd = this.generator.generateERDiagramText(dmmf, 'erd');
    results.push('== ER diagram');
    results.push(`[plantuml,target=erd,format=svg]`);
    results.push('....');
    results.push(...erd);
    results.push('....');
    //
    for (const model of dmmf.datamodel.models) {
      const name = createTableName(
        model,
        this.generator.config.usePhysicalTableName,
      );
      results.push(`[[${name}]]`);
      results.push(`== ${name}`);
      results.push('');
      results.push('=== Description');
      results.push(model.documentation || '');

      results.push('');
      results.push(`=== Columns`);

      const columns = [
        'Name',
        'Type',
        'Default',
        'Nullable',
        'Children',
        'Parent',
        'Comment',
      ];
      results.push(`[format="csv", options="header, autowidth"]`);
      results.push('|====');
      results.push(columns.join(','));

      for (const field of model.fields) {
        if (field.relationName) continue;

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
          doubleQuote(field.name),
          doubleQuote(field.type),
          doubleQuote(getDefault(field) + ''),
          doubleQuote(!field.isRequired + ''),
          doubleQuote(relation.map((r) => this.toAdocLink(r)).join(', ')),
          m
            ? this.toAdocLink(
                createTableName(
                  m,
                  this.generator.config.usePhysicalTableName,
                ) || '',
              )
            : '',
          doubleQuote(field.documentation || ''),
        ];

        results.push(column.join(','));
      }
      results.push('|====');

      // draw er diagram
      results.push('');
      results.push('=== ER diagram');

      const filteredDmmf = createFilteredDMMFDocument(dmmf, model.name);
      const subPumlString = this.generator.generateERDiagramText(
        filteredDmmf,
        model.name,
      );
      results.push(`[plantuml,target=${model.name},format=svg]`);
      results.push('....');
      results.push(...subPumlString);
      results.push('....');
    }
    return results;
  }

  private toAdocLink(name?: string) {
    if (!name) return '';
    return `link:#${name}[${name}]`;
  }
}
