import { DMMF } from '@prisma/generator-helper';
import { getDMMF } from '@prisma/internals';

export const getDMMFFromFile = (filepath: string) => {
  return getDMMF({
    datamodelPath: filepath,
  }) as unknown as Promise<DMMF.Document>;
};
