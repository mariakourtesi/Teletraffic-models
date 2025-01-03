import { Command } from 'commander';
import { ServiceClass } from '../formulas/types';
import { kaufmanRoberts } from '../formulas/kaufman-roberts/kaufman-roberts-formula';

export default () =>
  new Command('kaufman-roberts')
    .description(
      'Calculates the blocking probabilities in a network using the Kaufman-Roberts formula'
    )
    .option('-c, --capacity <capacity>', 'The capacity of the network', parseInt) // Ensuring capacity is treated as a number
    .option(
      '-s, --serviceClasses <serviceClasses>',
      'The service classes in the network (in JSON format)'
    )
    .action((options) => {
      const { capacity, serviceClasses } = options;
      let parsedServiceClasses: ServiceClass[];

      try {
        parsedServiceClasses = JSON.parse(serviceClasses);

        if (!Array.isArray(parsedServiceClasses) || parsedServiceClasses.length === 0) {
          throw new Error('serviceClasses must be a non-empty array of objects.');
        }

        console.log(kaufmanRoberts(capacity, parsedServiceClasses));
      } catch (error) {
        console.error(`Failed to process serviceClasses: ${error}`);
        process.exit(1);
      }
    });
