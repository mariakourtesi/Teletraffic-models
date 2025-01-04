import {
  calculateBlockingLAR,
  calculateBlockingRatios,
  calculateEi,
  calculateSubsystemBlockingKaufmanRoberts,
  processResultInRLA
} from './proposed-model';
import { calculateTrafficLoad, TrafficLoad } from './traffic-load';
import { Capacities, ServiceClassConfigs } from './types';

const resourceCount = 3;
const capacities: Capacities = {
  ramCapacity: { link: 1, bu: 32 },
  processorCapacity: { link: 2, bu: 24 },
  diskCapacity: { link: 3, bu: 28 },
  bpsCapacity: { link: 4, bu: 40 }
};

const serviceClassConfigs: ServiceClassConfigs = {
  ram: [
    {
      serviceClass: 1,
      incomingLoad_a: 0,
      bu: 1
    },
    {
      serviceClass: 2,
      incomingLoad_a: 0,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 0,
      bu: 4
    }
  ],
  processor: [
    {
      serviceClass: 1,
      incomingLoad_a: 0,
      bu: 1
    },
    {
      serviceClass: 2,
      incomingLoad_a: 0,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 0,
      bu: 4
    }
  ],
  disk: [
    {
      serviceClass: 1,
      incomingLoad_a: 0,
      bu: 1
    },
    {
      serviceClass: 2,
      incomingLoad_a: 0,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 0,
      bu: 4
    }
  ],
  bitrate: [
    {
      serviceClass: 1,
      incomingLoad_a: 0,
      bu: 2
    },
    {
      serviceClass: 2,
      incomingLoad_a: 0,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 0,
      bu: 2
    }
  ]
};
const calculateSeviceClassesForRLA = (serviceClassConfigs: ServiceClassConfigs) => {
  return Object.values(serviceClassConfigs.ram).map((ramEntry) => {
    const serviceClass = ramEntry.serviceClass;

    const route = Object.keys(serviceClassConfigs).map((key, index) => ({
      link: index + 1,
      bu:
        serviceClassConfigs[key as keyof ServiceClassConfigs].find(
          (config) => config.serviceClass === serviceClass
        )?.bu || 0
    }));

    return {
      serviceClass,
      incomingLoad_a: ramEntry.incomingLoad_a,
      route
    };
  });
};

export const proposedModel = (
  resourceCount: number,
  capacities: Capacities,
  initialLoad: number,
  serviceClasses: ServiceClassConfigs
) => {
  const startTime = performance.now();
  const trafficLoad = calculateTrafficLoad(
    initialLoad,
    capacities.ramCapacity.bu,
    serviceClasses.ram
  );

  Object.keys(serviceClassConfigs).forEach((category) => {
    const key = category as keyof ServiceClassConfigs;
    serviceClassConfigs[key].forEach((item) => {
      if (trafficLoad[item.serviceClass] !== undefined) {
        item.incomingLoad_a = trafficLoad[item.serviceClass];
      }
    });
  });

  const kaufmanRoberts = calculateSubsystemBlockingKaufmanRoberts(capacities, serviceClassConfigs);

  const serviceClassConfigsLAR = {
    ram: serviceClassConfigs.ram.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    })),
    processor: serviceClassConfigs.processor.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    })),
    disk: serviceClassConfigs.disk.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    })),
    bitrate: (serviceClassConfigs.bitrate ?? []).map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    }))
  };

  const lar = calculateBlockingLAR(resourceCount, capacities, serviceClassConfigsLAR);

  const relationR = calculateBlockingRatios(kaufmanRoberts, lar);

  const serviceClassesinRLA = calculateSeviceClassesForRLA(serviceClassConfigs);

  const reducedLoadApproximation = processResultInRLA(capacities, serviceClassesinRLA);

  const Ei = calculateEi(relationR, reducedLoadApproximation);
  // console.log(
  //   `Time taken to execute proposed model: ${performance.now() - startTime} milliseconds`
  // );
  return Ei;
};

//, 1.1, 1.2, 1.
[0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3].forEach((initialLoad) => {
  console.log('initialLoad', initialLoad);
  console.log(proposedModel(resourceCount, capacities, initialLoad, serviceClassConfigs));
});

//console.log(proposedModel(resourceCount, capacities, 1.3, serviceClassConfigs));
//{ B_class_1: 0.0181632, B_class_2: 0.0736552, B_class_3: 0.2381134 }
