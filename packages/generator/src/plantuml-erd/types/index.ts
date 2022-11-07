import { z } from 'zod';
export const PlantUmlErdGeneratorConfigsSchema = z.object({
  output: z.string().optional().default('./erd.puml'),
  usePhysicalTableName: z.boolean().optional().default(false),
  lineLength: z.string().regex(/-+/).optional().default('--'),
  relationMiniumOne: z.boolean().optional().default(false),
  debug: z.boolean().optional().default(false),
  exportPerTables: z.boolean().optional().default(false),
});
export type PlantUmlErdGeneratorConfigsInput = z.input<
  typeof PlantUmlErdGeneratorConfigsSchema
>;

export type PlantUmlErdGeneratorConfigs = z.infer<
  typeof PlantUmlErdGeneratorConfigsSchema
>;
