import { readFileSync } from 'fs';
import path from 'path';
import { getDMMFFromFile } from '../helpers';

import { PlantUmlErdGenerator } from '../plantuml-erd';
import { PlantUmlErdGeneratorConfigsInput } from '../plantuml-erd/types';

test('enum generation', async () => {
  const sampleDMMF = await getDMMFFromFile(
    path.join(__dirname, './__fixtures__/sample.prisma'),
  );

  const outputfile1 = './tmp/example1.puml';
  const generator = new PlantUmlErdGenerator({
    output: outputfile1,
    // usePhysicalTableName: true,
    lineLength: '--',
    exportPerTables: 'true',
    markdownOutput: './tmp/example1.md',
    asciidocOutput: './tmp/example2.adoc',
    showUniqueKeyLabel: 'true',
  });
  await generator.generate(sampleDMMF);
  const pumlfile1 = readFileSync(outputfile1).toString();
  expect(pumlfile1.includes(`User }o--|| Team`)).toBeTruthy();
  expect(pumlfile1.includes('Team }o--o{ Company')).toBeTruthy();
  expect(pumlfile1.includes('User |o--|{ Language')).toBeTruthy();
  expect(pumlfile1.includes('ユーザ" as User')).toBeTruthy();
  expect(pumlfile1.includes(`entity "User`)).toBeTruthy();
  expect(pumlfile1.match(/@startuml/g)?.length).toBeGreaterThan(1); // export per table
  expect(pumlfile1.match(/undefined/g)?.length).toBeUndefined();
  expect(pumlfile1.includes('[UK]')).toBeTruthy();
  const markdown1 = readFileSync('./tmp/example1.md').toString();
  expect(markdown1.length).toBeGreaterThan(0);
  const outputfile2 = './tmp/example2.puml';
  const generator2 = new PlantUmlErdGenerator({
    output: outputfile2,
    usePhysicalTableName: 'true',
    lineLength: '---',
    markdownOutput: './tmp/example2.md',
    markdownIncludeERD: 'true',
  });
  await generator2.generate(sampleDMMF);
  const pumlfile2 = readFileSync(outputfile2).toString();
  expect(pumlfile2.includes('User |o---|{ Language')).toBeTruthy(); // `---`line
  expect(pumlfile2.includes(`entity "users`)).toBeTruthy(); // physical table name
  expect(pumlfile2.match(/@startuml/g)?.length).toBe(1); // export one puml
  const markdown2 = readFileSync('./tmp/example2.md').toString();
  expect(markdown2.length).toBeGreaterThan(0);
  expect(markdown2.match(/```plantuml/g)?.length).toBe(7);
  expect(pumlfile2.includes('[UK]')).toBeFalsy();

  const outputfile3 = './tmp/example3.puml';
  const generator3 = new PlantUmlErdGenerator({
    output: outputfile3,
    lineLength: '---',
    debug: 'false',
  });
  await generator3.generate(
    await getDMMFFromFile(
      path.join(__dirname, './__fixtures__/sample3.prisma'),
    ),
  );
  expect(readFileSync(outputfile3).toString().includes('---')).toBe(true);
});

test('debug mode writes to /tmp/example.json', async () => {
  const sampleDMMF = await getDMMFFromFile(
    path.join(__dirname, './__fixtures__/sample.prisma'),
  );

  const outputfile = './tmp/debug-test.puml';
  const generator = new PlantUmlErdGenerator({
    output: outputfile,
    debug: 'true',
  });
  await generator.generate(sampleDMMF);
  const debugFile = readFileSync('/tmp/example.json').toString();
  expect(debugFile.length).toBeGreaterThan(0);
  expect(JSON.parse(debugFile)).toBeTruthy();
});

test('unique indexes in markdown output', async () => {
  const sampleDMMF = await getDMMFFromFile(
    path.join(__dirname, './__fixtures__/sample.prisma'),
  );

  const markdownOutput = './tmp/unique-indexes.md';
  const generator = new PlantUmlErdGenerator({
    output: './tmp/unique-indexes.puml',
    markdownOutput: markdownOutput,
  });
  await generator.generate(sampleDMMF);
  const markdown = readFileSync(markdownOutput).toString();
  expect(markdown.length).toBeGreaterThan(0);
});

describe('Generated files parsability', () => {
  test.each([
    {
      fileType: 'PlantUML',
      config: { output: './tmp/parsable-test.puml' },
      outputPath: './tmp/parsable-test.puml',
      assertions: (content: string) => {
        // Check PlantUML syntax is valid
        expect(content).toContain('@startuml');
        expect(content).toContain('@enduml');

        // Check that @startuml and @enduml are properly paired
        const startumlCount = (content.match(/@startuml/g) || []).length;
        const endumlCount = (content.match(/@enduml/g) || []).length;
        expect(startumlCount).toBe(endumlCount);
        expect(startumlCount).toBeGreaterThan(0);

        // Check no undefined values
        expect(content).not.toContain('undefined');

        // Check valid entity declarations
        const entityMatches = content.match(/entity ".*" as \w+/g);
        expect(entityMatches).toBeTruthy();
        expect(entityMatches!.length).toBeGreaterThan(0);
      },
    },
    {
      fileType: 'Markdown',
      config: {
        output: './tmp/parsable-markdown-test.puml',
        markdownOutput: './tmp/parsable-markdown-test.md',
        markdownIncludeERD: 'true' as const,
      },
      outputPath: './tmp/parsable-markdown-test.md',
      assertions: (content: string) => {
        // Check markdown structure
        expect(content).toContain('# Tables');
        expect(content).toContain('# ER diagram');
        expect(content).toContain('```plantuml');

        // Check that code blocks are properly closed
        const openCodeBlocks = (content.match(/```plantuml/g) || []).length;
        expect(openCodeBlocks).toBeGreaterThan(0);

        // Check markdown tables are properly formatted
        const tableHeaders = content.match(/\|.*\|/g);
        expect(tableHeaders).toBeTruthy();
        expect(tableHeaders!.length).toBeGreaterThan(0);

        // Check no undefined values
        expect(content).not.toContain('undefined');
      },
    },
    {
      fileType: 'AsciiDoc',
      config: {
        output: './tmp/parsable-asciidoc-test.puml',
        asciidocOutput: './tmp/parsable-asciidoc-test.adoc',
      },
      outputPath: './tmp/parsable-asciidoc-test.adoc',
      assertions: (content: string) => {
        // Check AsciiDoc structure
        expect(content).toContain(':toc: left');
        expect(content).toContain(':nofooter:');
        expect(content).toContain('== ER diagram');

        // Check PlantUML blocks are properly formatted
        expect(content).toContain('[plantuml,target=erd,format=svg]');
        expect(content).toContain('....');

        // Check that plantuml blocks are properly closed
        const openBlocks = (content.match(/\[plantuml,.*\]/g) || []).length;
        const dotsCount = (content.match(/\.\.\.\./g) || []).length;
        expect(openBlocks).toBeGreaterThan(0);
        expect(dotsCount).toBe(openBlocks * 2); // Each block has opening and closing ....

        // Check tables are properly formatted
        expect(content).toContain('[format="csv", options="header, autowidth"]');
        expect(content).toContain('|====');

        // Check no undefined values
        expect(content).not.toContain('undefined');
      },
    },
  ])('generated $fileType files are parsable', async ({ config, outputPath, assertions }) => {
    const sampleDMMF = await getDMMFFromFile(
      path.join(__dirname, './__fixtures__/sample.prisma'),
    );

    const generator = new PlantUmlErdGenerator(config);
    await generator.generate(sampleDMMF);
    const content = readFileSync(outputPath).toString();

    assertions(content);
  });
});

test('enum with documentation and dbName', async () => {
  const sampleDMMF = await getDMMFFromFile(
    path.join(__dirname, './__fixtures__/sample-with-docs.prisma'),
  );

  const outputfile = './tmp/enum-with-docs.puml';
  const generator = new PlantUmlErdGenerator({
    output: outputfile,
  });
  await generator.generate(sampleDMMF);
  const pumlContent = readFileSync(outputfile).toString();

  // Check enum documentation is included
  expect(pumlContent).toContain('User status enum');

  // Check enum values with dbName
  expect(pumlContent).toContain('ACTIVE');
  expect(pumlContent).toContain('active');
  expect(pumlContent).toContain('PENDING');
  expect(pumlContent).toContain('pending');
});

test('markdown with unique indexes', async () => {
  const sampleDMMF = await getDMMFFromFile(
    path.join(__dirname, './__fixtures__/sample-with-docs.prisma'),
  );

  const markdownOutput = './tmp/unique-indexes-detailed.md';
  const generator = new PlantUmlErdGenerator({
    output: './tmp/unique-indexes-detailed.puml',
    markdownOutput: markdownOutput,
  });
  await generator.generate(sampleDMMF);
  const markdown = readFileSync(markdownOutput).toString();

  // Check that unique index section exists
  expect(markdown).toContain('# Indexes');
  expect(markdown).toContain('email,status');
  expect(markdown).toContain('unique');
});

test('field documentation in ERD', async () => {
  const sampleDMMF = await getDMMFFromFile(
    path.join(__dirname, './__fixtures__/sample-field-docs.prisma'),
  );

  const outputfile = './tmp/field-docs.puml';
  const generator = new PlantUmlErdGenerator({
    output: outputfile,
  });
  await generator.generate(sampleDMMF);
  const pumlContent = readFileSync(outputfile).toString();

  // Check field documentation is included (without @ symbols)
  expect(pumlContent).toContain('User email address');
  expect(pumlContent).toContain('User full name');
});

const optionPatterns: {
  key: keyof PlantUmlErdGeneratorConfigsInput;
  patterns: {
    options: PlantUmlErdGeneratorConfigsInput;
    expected: (params: {
      pumlString?: string;
      markdownString?: string;
      asciidocString?: string;
    }) => void;
  }[];
}[] = [
  {
    key: 'lineType',
    patterns: [
      {
        options: {
          lineType: undefined,
        },
        expected(params) {
          expect(
            params.pumlString?.includes(`skinparam linetype ortho`),
          ).toBeTruthy();
        },
      },
      {
        options: {
          lineType: 'unset',
        },
        expected(params) {
          expect(params.pumlString?.includes(`skinparam linetype`)).toBeFalsy();
        },
      },
      {
        options: {
          lineType: 'ortho',
        },
        expected(params) {
          expect(
            params.pumlString?.includes(`skinparam linetype ortho`),
          ).toBeTruthy();
        },
      },
      {
        options: {
          lineType: 'polyline',
        },
        expected(params) {
          expect(
            params.pumlString?.includes(`skinparam linetype polyline`),
          ).toBeTruthy();
        },
      },
    ],
  },
  {
    key: 'showUniqueKeyLabel',
    patterns: [
      {
        options: {
          showUniqueKeyLabel: undefined,
        },
        expected(params) {
          expect(params.pumlString?.includes(`[UK]`)).toBeFalsy();
        },
      },
      {
        options: {
          showUniqueKeyLabel: 'true',
        },
        expected(params) {
          expect(params.pumlString?.includes(`[UK]`)).toBeTruthy();
        },
      },
      {
        options: {
          showUniqueKeyLabel: 'false',
        },
        expected(params) {
          expect(params.pumlString?.includes(`[UK]`)).toBeFalsy();
        },
      },
    ],
  },
  {
    key: 'isShowForeignKeyOnRelation',
    patterns: [
      {
        options: {
          isShowForeignKeyOnRelation: undefined,
        },
        expected(params) {
          expect(
            params.pumlString?.includes(`User }o--|| Team: team_id`),
          ).toBeFalsy();
        },
      },
      {
        options: {
          isShowForeignKeyOnRelation: 'false',
        },
        expected(params) {
          expect(
            params.pumlString?.includes(`User }o--|| Team: team_id`),
          ).toBeFalsy();
        },
      },
      {
        options: {
          isShowForeignKeyOnRelation: 'true',
        },
        expected(params) {
          expect(
            params.pumlString?.includes(`User }o--|| Team: team_id`),
          ).toBeTruthy();
        },
      },
    ],
  },
  {
    key: 'isLeftToRightDirection',
    patterns: [
      {
        options: {
          isLeftToRightDirection: undefined,
        },
        expected(params) {
          expect(
            params.pumlString?.includes(`left to right direction`),
          ).toBeFalsy();
        },
      },
      {
        options: {
          isLeftToRightDirection: 'false',
        },
        expected(params) {
          expect(
            params.pumlString?.includes(`left to right direction`),
          ).toBeFalsy();
        },
      },
      {
        options: {
          isLeftToRightDirection: 'true',
        },
        expected(params) {
          expect(
            params.pumlString?.includes(`left to right direction`),
          ).toBeTruthy();
        },
      },
    ],
  },
  {
    key: 'relationMiniumOne',
    patterns: [
      {
        options: {
          relationMiniumOne: 'true',
        },
        expected(params) {
          expect(params.pumlString?.includes(`}|--||`)).toBeTruthy();
        },
      },
    ],
  },
  //
  {
    key: 'additionalPlantUMLParams',
    patterns: [
      {
        options: {
          additionalPlantUMLParams: 'hide circle',
        },
        expected(params) {
          expect(
            params.pumlString?.includes(`skinparam linetype ortho
hide circle
`),
          ).toBeTruthy();
        },
      },
      {
        options: {
          additionalPlantUMLParams:
            'hide circle; skinparam backgroundColor transparent',
        },
        expected(params) {
          expect(
            params.pumlString?.includes(
              `skinparam linetype ortho
hide circle
skinparam backgroundColor transparent`,
            ),
          ).toBeTruthy();
        },
      },
    ],
  },
];

describe('option pattern test', () => {
  for (const option of optionPatterns) {
    describe(option.key, () => {
      for (const pattern of option.patterns) {
        it(`${JSON.stringify(pattern.options)}`, async () => {
          const sampleDMMF = await getDMMFFromFile(
            path.join(__dirname, './__fixtures__/sample.prisma'),
          );

          const outputfile1 = './tmp/example1.puml';
          const generator = new PlantUmlErdGenerator({
            ...pattern.options,
            output: outputfile1,
          });
          await generator.generate(sampleDMMF);
          const pumlfile1 = readFileSync(outputfile1).toString();

          const asciidocOutput = pattern.options.asciidocOutput
            ? readFileSync(pattern.options.asciidocOutput).toString()
            : undefined;
          const markdownOutput = pattern.options.markdownOutput
            ? readFileSync(pattern.options.markdownOutput).toString()
            : undefined;

          pattern.expected({
            asciidocString: asciidocOutput,
            markdownString: markdownOutput,
            pumlString: pumlfile1,
          });
        });
      }
    });
  }
});
