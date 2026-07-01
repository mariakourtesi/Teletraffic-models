import {
  calculateBlockingLAR,
  calculateBlockingRatios,
  calculateEi,
  calculateSubsystemBlockingKaufmanRoberts,
  processResultInDziongRoberts,
  processResultInRLA
} from './proposed-model';
import { calculateTrafficLoad } from './traffic-load';
import { Capacities, ServiceClassConfigs } from './types';

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

  Object.keys(serviceClasses).forEach((category) => {
    const key = category as keyof ServiceClassConfigs;
    serviceClasses[key].forEach((item) => {
      if (trafficLoad[item.serviceClass] !== undefined) {
        item.incomingLoad_a = trafficLoad[item.serviceClass];
      }
    });
  });

  const kaufmanRoberts = calculateSubsystemBlockingKaufmanRoberts(capacities, serviceClasses);

  const serviceClassConfigsLAR = {
    ram: serviceClasses.ram.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    })),
    processor: serviceClasses.processor.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    })),
    disk: serviceClasses.disk.map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    })),
    bitrate: (serviceClasses.bitrate ?? []).map((item) => ({
      ...item,
      incomingLoad_a: item.incomingLoad_a * 3
    }))
  };

  const lar = calculateBlockingLAR(resourceCount, capacities, serviceClassConfigsLAR);

  const relationR = calculateBlockingRatios(kaufmanRoberts, lar);

  const serviceClassesinRLA = calculateSeviceClassesForRLA(serviceClasses);

  const reducedLoadApproximation = processResultInRLA(capacities, serviceClassesinRLA);

  const dziongRoberts = processResultInDziongRoberts(capacities, serviceClassesinRLA);

  console.log('reducedLoadApproximation', processResultInRLA);

  console.log('dziongRoberts', dziongRoberts);

  const Ei = calculateEi(relationR, reducedLoadApproximation);

  console.log(
    `Time taken to execute proposed model: ${performance.now() - startTime} milliseconds`
  );
  return Ei;
};

const capacities: Capacities = {
  ramCapacity: { link: 1, bu: 10 },
  processorCapacity: { link: 2, bu: 12 },
  diskCapacity: { link: 3, bu: 11 },
  bpsCapacity: { link: 4, bu: 10 }
};

const serviceClassses = {
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
      bu: 3
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
      bu: 3
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
      bu: 3
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

console.log(proposedModel(3, capacities, 0.9, serviceClassses));
