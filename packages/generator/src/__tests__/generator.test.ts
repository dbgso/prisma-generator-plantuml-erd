import { getDMMF, getSchemaSync } from '@prisma/sdk';
import { readFileSync } from 'fs';
import path from 'path';
import { getDMMFFromFile } from '../helpers';

import { PlantUmlErdGenerator } from '../plantuml-erd';

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

  const outputfile3 = './tmp/example3.puml';
  const generator3 = new PlantUmlErdGenerator({
    output: outputfile3,
    lineLength: '---',
    debug: 'false',
  });

  await generator3.generate(
    await getDMMF({
      datamodel: getSchemaSync(
        path.join(__dirname, './__fixtures__/sample3.prisma'),
      ),
    }),
  );
  expect(readFileSync(outputfile3).toString().includes('---')).toBe(true);
});
