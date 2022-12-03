import { z } from 'zod';
const optionalStrinToBooleanSchema = (flg: boolean) =>
  z
    .enum(['true', 'false'])
    .optional()
    .default(flg ? 'true' : 'false')
    .transform((args) => args === 'true');

export const PlantUmlErdGeneratorConfigsSchema = z.object({
  output: z.string().optional().default('./erd.puml'),
  usePhysicalTableName: optionalStrinToBooleanSchema(false),
  lineLength: z.string().regex(/-+/).optional().default('--'),
  relationMiniumOne: optionalStrinToBooleanSchema(false),
  debug: optionalStrinToBooleanSchema(false),
  exportPerTables: optionalStrinToBooleanSchema(false),
  markdownOutput: z.string().optional(),
  /** is dump  */
  markdownDrawERD: optionalStrinToBooleanSchema(false),
});
export type PlantUmlErdGeneratorConfigsInput = z.input<
  typeof PlantUmlErdGeneratorConfigsSchema
>;

export type PlantUmlErdGeneratorConfigs = z.infer<
  typeof PlantUmlErdGeneratorConfigsSchema
>;
