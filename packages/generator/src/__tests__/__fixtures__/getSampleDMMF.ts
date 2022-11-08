import path from 'path';
import { getDMMF, getSchemaSync } from 'prisma';

const samplePrismaSchema = getSchemaSync(
  path.join(__dirname, './sample.prisma'),
);

export const getSampleDMMF = async () => {
  return getDMMF({
    datamodel: samplePrismaSchema,
  });
};
