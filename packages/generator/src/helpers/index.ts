import { getDMMF, getSchemaSync } from '@prisma/sdk';

export const getDMMFFromFile = (filepath: string) => {
  return getDMMF({
    datamodel: getSchemaSync(filepath),
  });
};
