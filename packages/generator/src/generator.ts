import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import { logger } from '@prisma/sdk';
import { GENERATOR_NAME } from './constants';
import { PlantUmlErdGenerator } from './plantuml-erd';

const { version } = require('../package.json');

generatorHandler({
  onManifest() {
    logger.info(`${GENERATOR_NAME}:Registered`);
    return {
      version,
      defaultOutput: '../generated',
      prettyName: GENERATOR_NAME,
    };
  },
  onGenerate: async (options: GeneratorOptions) => {
    const generator = new PlantUmlErdGenerator(options.generator.config);
    await generator.generate(options.dmmf);
  },
});
