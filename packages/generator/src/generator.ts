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
    console.log(options.generator);

    if (options.generator.output) {
    }

    const output = getOutput(options);
    console.log(output);

    const generator = new PlantUmlErdGenerator({
      output: output,
      ...options.generator.config,
    });
    await generator.generate(options.dmmf);
  },
});
function getOutput(options: GeneratorOptions) {
  if (options.generator.output) {
    if (options.generator.output.fromEnvVar === null) {
      return options.generator.output.value;
    }
  }
  return undefined;
}
