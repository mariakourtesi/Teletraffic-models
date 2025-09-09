import { Command } from 'commander';
import { ServiceClass, ServiceClassWithRoute } from '../formulas/types';
import { callBlockingProbabilityinRLA } from '../formulas/reduced-load-approximation/reduced-load-approximation';

export default () =>
  new Command('rla')
    .description(
      'Calculates the blocking probabilities in a network using the Reduced Load Approximation formula'
    )
    .option('-l, --links <links>', 'Network topology')
    .option(
      '-s, --serviceClasses <serviceClasses>',
      'The service classes in the network (in JSON format)'
    )
    .action((options) => {
      const { links, serviceClasses } = options;
      let parsedServiceClasses: ServiceClassWithRoute[];

      try {
        parsedServiceClasses = JSON.parse(serviceClasses);

        if (!Array.isArray(parsedServiceClasses) || parsedServiceClasses.length === 0) {
          throw new Error('serviceClasses must be a non-empty array of objects.');
        }

        console.log(callBlockingProbabilityinRLA(links, parsedServiceClasses));
      } catch (error) {
        console.error(`Failed to process serviceClasses: ${error}`);
        process.exit(1);
      }
    });
