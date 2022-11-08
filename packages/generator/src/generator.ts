import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import { GENERATOR_NAME } from './constants';
import { PlantUmlErdGenerator } from './plantuml-erd';

const { version } = require('../package.json');

generatorHandler({
  onManifest() {
    return {
      version,
      defaultOutput: '../generated',
      prettyName: GENERATOR_NAME,
    };
  },
  onGenerate: async (options: GeneratorOptions) => {
    const generator = new PlantUmlErdGenerator({
      output: options.generator.output?.value,
      ...options.generator.config,
    });
    await generator.generate(options.dmmf);
  },
});
