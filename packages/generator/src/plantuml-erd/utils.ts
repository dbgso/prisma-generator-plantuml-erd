import { DMMF } from '@prisma/generator-helper';
import { z } from 'zod';

export function doubleQuote(base: string) {
  return `"${base}"`;
}

export function getDefault(field: DMMF.Field) {
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

/** filtering models and enums */
export function createFilteredDMMFDocument(
  dmmf: DMMF.Document,
  targetTableName: string,
) {
  if (!targetTableName) return dmmf;

  // target model
  const target = dmmf.datamodel.models.find((e) => e.name === targetTableName);
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

export function createTableName(
  model: DMMF.Model,
  isUsePhysicalTableName: boolean,
) {
  if (isUsePhysicalTableName) return model.dbName || '';
  return model.name;
}

export function findParentField(
  models: DMMF.Model[],
  baseModelName: string,
  relationToField: string,
  isUsePhysicalTableName: boolean,
) {
  const results: string[] = [];
  for (const model of models) {
    const foundField = model.fields
      .filter((e) => e.relationToFields?.length)
      .find((f) => f.type === baseModelName);
    if (foundField?.relationToFields?.includes(relationToField)) {
      results.push(createTableName(model, isUsePhysicalTableName) || '');
    }
  }
  return results;
}

export function isForeignKey(field: DMMF.Field, modelsFields: DMMF.Field[]) {
  const foreignKey = modelsFields.find((f) =>
    f.relationFromFields?.includes(field.name),
  );

  if (foreignKey) return true;
  return false;
}
