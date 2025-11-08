import { DMMF } from '@prisma/generator-helper';
import path from 'path';
import { getDMMFFromFile } from '../helpers';
import {
  doubleQuote,
  getDefault,
  createFilteredDMMFDocument,
  createTableName,
  findParentField,
  isForeignKey,
} from '../plantuml-erd/utils';

describe('plantuml-erd/utils', () => {
  describe('doubleQuote', () => {
    test.each([
      { input: 'test', expected: '"test"', description: 'wrap string in double quotes' },
      { input: '', expected: '""', description: 'wrap empty string in double quotes' },
    ])('should $description ($input)', ({ input, expected }) => {
      expect(doubleQuote(input)).toBe(expected);
    });
  });

  describe('getDefault', () => {
    it('should return empty string when no default value', () => {
      const field: DMMF.Field = {
        name: 'test',
        kind: 'scalar',
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isReadOnly: false,
        hasDefaultValue: false,
        type: 'String',
        isGenerated: false,
        isUpdatedAt: false,
      };
      expect(getDefault(field)).toBe('');
    });

    it('should return default value name when default is object with name', () => {
      const field: DMMF.Field = {
        name: 'test',
        kind: 'scalar',
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isReadOnly: false,
        hasDefaultValue: true,
        type: 'String',
        isGenerated: false,
        isUpdatedAt: false,
        default: { name: 'autoincrement', args: [] },
      };
      expect(getDefault(field)).toBe('autoincrement');
    });

    it('should return default value as-is when not an object with name', () => {
      const field: DMMF.Field = {
        name: 'test',
        kind: 'scalar',
        isList: false,
        isRequired: true,
        isUnique: false,
        isId: false,
        isReadOnly: false,
        hasDefaultValue: true,
        type: 'String',
        isGenerated: false,
        isUpdatedAt: false,
        default: 'defaultValue',
      };
      expect(getDefault(field)).toBe('defaultValue');
    });
  });

  describe('createFilteredDMMFDocument', () => {
    let sampleDMMF: DMMF.Document;

    beforeAll(async () => {
      sampleDMMF = await getDMMFFromFile(
        path.join(__dirname, './__fixtures__/sample.prisma'),
      );
    });

    it('should return original dmmf when targetTableName is empty', () => {
      const result = createFilteredDMMFDocument(sampleDMMF, '');
      expect(result).toBe(sampleDMMF);
    });

    it('should return original dmmf when target model not found', () => {
      const result = createFilteredDMMFDocument(sampleDMMF, 'NonExistentModel');
      expect(result).toBe(sampleDMMF);
    });

    it('should filter models and enums for target table', () => {
      const result = createFilteredDMMFDocument(sampleDMMF, 'User');
      expect(result.datamodel.models.length).toBeLessThan(
        sampleDMMF.datamodel.models.length,
      );
      expect(
        result.datamodel.models.some((m) => m.name === 'User'),
      ).toBeTruthy();
    });
  });

  describe('createTableName', () => {
    const model: DMMF.Model = {
      name: 'User',
      dbName: 'users',
      fields: [],
      primaryKey: null,
      uniqueFields: [],
      uniqueIndexes: [],
      isGenerated: false,
    };

    const modelWithoutDbName: DMMF.Model = {
      name: 'Test',
      dbName: null,
      fields: [],
      primaryKey: null,
      uniqueFields: [],
      uniqueIndexes: [],
      isGenerated: false,
    };

    test.each([
      { model, usePhysical: true, expected: 'users', description: 'return dbName when usePhysicalTableName is true' },
      { model, usePhysical: false, expected: 'User', description: 'return model name when usePhysicalTableName is false' },
      { model: modelWithoutDbName, usePhysical: true, expected: '', description: 'return empty string when dbName is null and usePhysicalTableName is true' },
    ])('should $description', ({ model, usePhysical, expected }) => {
      expect(createTableName(model, usePhysical)).toBe(expected);
    });
  });

  describe('findParentField', () => {
    let sampleDMMF: DMMF.Document;

    beforeAll(async () => {
      sampleDMMF = await getDMMFFromFile(
        path.join(__dirname, './__fixtures__/sample.prisma'),
      );
    });

    test.each([
      { baseModelName: 'Team', relationToField: 'id', expectedLength: 'greaterThan0', description: 'find parent fields that reference the base model' },
      { baseModelName: 'NonExistent', relationToField: 'id', expectedLength: 0, description: 'return empty array when no parent field found' },
    ])('should $description', ({ baseModelName, relationToField, expectedLength }) => {
      const results = findParentField(
        [...sampleDMMF.datamodel.models],
        baseModelName,
        relationToField,
        false,
      );
      if (expectedLength === 'greaterThan0') {
        expect(results.length).toBeGreaterThan(0);
      } else {
        expect(results.length).toBe(expectedLength);
      }
    });
  });

  describe('isForeignKey', () => {
    let sampleDMMF: DMMF.Document;

    beforeAll(async () => {
      sampleDMMF = await getDMMFFromFile(
        path.join(__dirname, './__fixtures__/sample.prisma'),
      );
    });

    test.each([
      { fieldName: 'team_id', expected: true, description: 'return true for foreign key fields' },
      { fieldName: 'email', expected: false, description: 'return false for non-foreign key fields' },
    ])('should $description ($fieldName)', ({ fieldName, expected }) => {
      const userModel = sampleDMMF.datamodel.models.find(
        (m) => m.name === 'User',
      );
      if (!userModel) throw new Error('User model not found');

      const field = userModel.fields.find((f) => f.name === fieldName);
      if (!field) throw new Error(`${fieldName} field not found`);

      expect(isForeignKey(field, [...userModel.fields])).toBe(expected);
    });
  });
});
