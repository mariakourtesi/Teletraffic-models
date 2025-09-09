import { Command } from 'commander';
import { ServiceClass } from '../formulas/types';
import { callBlockingProbability } from '../formulas/kaufman-roberts/call-blocking-probability';

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
        const data = callBlockingProbability(capacity, parsedServiceClasses);

        console.table(
          Object.entries(data).map(([key, value]) => ({
            Class: key,
            Blocking: value.toFixed(7)
          }))
        );
      } catch (error) {
        console.error(`Failed to process serviceClasses: ${error}`);
        process.exit(1);
      }
    });
