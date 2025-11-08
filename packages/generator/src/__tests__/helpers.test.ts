import { DMMF } from '@prisma/generator-helper';
import { genEnum } from '../helpers/genEnum';

describe('helpers/genEnum', () => {
  test.each([
    {
      enumData: {
        name: 'Status',
        values: [
          { name: 'Active', dbName: null },
          { name: 'Inactive', dbName: null },
          { name: 'Pending', dbName: null },
        ],
        dbName: null,
      },
      expectedContents: ['enum Status', 'Active="Active"', 'Inactive="Inactive"', 'Pending="Pending"'],
      description: 'generate enum definition with multiple values',
    },
    {
      enumData: {
        name: 'SingleValue',
        values: [{ name: 'OnlyOne', dbName: null }],
        dbName: null,
      },
      expectedContents: ['enum SingleValue', 'OnlyOne="OnlyOne"'],
      description: 'handle single value enum',
    },
  ])('should $description', ({ enumData, expectedContents }) => {
    const result = genEnum(enumData as DMMF.DatamodelEnum);
    expectedContents.forEach((expected) => {
      expect(result).toContain(expected);
    });
  });
});
