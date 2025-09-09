import { Command } from 'commander';
import { proposedModel } from '../formulas/IEEE-proposed-model/proposed-model-data';
import { Capacities, ServiceClassConfigs } from '../formulas/IEEE-proposed-model/types';

export default () =>
  new Command('ieee-model')
    .description('Calculates the blocking probabilities in a cloud system.')
    .option('-r, --resources <resources>', 'The number of resources', parseInt)
    .option('-t, --trafficLoad <trafficLoad>', 'The number of resources')
    .option('-ram, --ram <ram>', 'Capacity of RAM', parseInt)
    .option('-cpu, --cpu <cpu>', 'Capacity of CPU', parseInt)
    .option('-disk, --disk <disk>', 'Capacity of Disk', parseInt)
    .option('-bps, --bps <bps>', 'Capacity of Bps', parseInt)
    .option(
      '-s, --serviceClasses <serviceClasses>',
      'The service classes in the network (in JSON format)'
    )
    .action((options) => {
      const { resources, ram, cpu, disk, bps, trafficLoad, serviceClasses } = options;
      let parsedServiceClasses: ServiceClassConfigs;

      const capacities: Capacities = {
        ramCapacity: { link: 1, bu: ram },
        processorCapacity: { link: 2, bu: cpu },
        diskCapacity: { link: 3, bu: disk },
        bpsCapacity: { link: 4, bu: bps }
      };

      try {
        parsedServiceClasses = JSON.parse(serviceClasses);

        console.log(proposedModel(resources, capacities, trafficLoad, parsedServiceClasses));
      } catch (error) {
        console.error(`Failed to process serviceClasses: ${error}`);
        process.exit(1);
      }
    });
