import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import { GENERATOR_NAME } from './constants';
import { environments } from './envs';
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
    // Check if generation is disabled via environment variable (takes precedence)
    const disableEnvVar = environments.DISABLE_PRISMA_ERD_GENERATION;
    if (disableEnvVar === 'true' || disableEnvVar === '1') {
      console.log('ER diagram generation is disabled by DISABLE_PRISMA_ERD_GENERATION environment variable');
      return;
    }

    // Check if generation is disabled via config
    const enabled = options.generator.config.enabled;
    if (enabled === 'false') {
      console.log('ER diagram generation is disabled by config (enabled = false)');
      return;
    }

    const output = getOutput(options);

    const generator = new PlantUmlErdGenerator({
      output: output,
      ...options.generator.config,
    });
    await generator.generate(options.dmmf);
  },
});
function getOutput(options: GeneratorOptions) {
  if (options.generator.output?.value) {
    if (options.generator.output.fromEnvVar === null) {
      return options.generator.output.value;
    }
  }
  return undefined;
}
