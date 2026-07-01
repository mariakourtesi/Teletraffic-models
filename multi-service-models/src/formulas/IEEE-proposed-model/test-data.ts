// data for testing
//TODO: move to test folder and add tests
import {
  calculateBlockingLAR,
  calculateBlockingRatios,
  calculateEi,
  calculateSubsystemBlockingKaufmanRoberts,
  processResultInRLA
} from './proposed-model';
import { Capacities, ServiceClassConfigs } from './types';

const serviceClassConfigs: ServiceClassConfigs = {
  ram: [
    {
      serviceClass: 1,
      incomingLoad_a: 9,
      bu: 1
    },
    {
      serviceClass: 2,
      incomingLoad_a: 4.5,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 3,
      bu: 3
    }
  ],
  processor: [
    {
      serviceClass: 1,
      incomingLoad_a: 9,
      bu: 1
    },
    {
      serviceClass: 2,
      incomingLoad_a: 4.5,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 3,
      bu: 3
    }
  ],
  disk: [
    {
      serviceClass: 1,
      incomingLoad_a: 9,
      bu: 1
    },
    {
      serviceClass: 2,
      incomingLoad_a: 4.5,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 3,
      bu: 3
    }
  ],
  bitrate: [
    {
      serviceClass: 1,
      incomingLoad_a: 9,
      bu: 2
    },
    {
      serviceClass: 2,
      incomingLoad_a: 4.5,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 3,
      bu: 2
    }
  ]
};

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

const serviceClasses = [
  {
    serviceClass: 1,
    incomingLoad_a: 9,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 1 },
      { link: 3, bu: 1 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 4.5,
    route: [
      { link: 1, bu: 2 },
      { link: 2, bu: 2 },
      { link: 3, bu: 2 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 3,
    incomingLoad_a: 3,
    route: [
      { link: 1, bu: 3 },
      { link: 2, bu: 3 },
      { link: 3, bu: 3 },
      { link: 4, bu: 2 }
    ]
  }
];

// const capacities: Capacities = {
//   ramCapacity: { link: 1, bu: 10 },
//   processorCapacity: { link: 2, bu: 12 },
//   diskCapacity: { link: 3, bu: 11 },
//   bpsCapacity: { link: 4, bu: 10 }
// };

const capacities: Capacities = {
  ramCapacity: { link: 1, bu: 10 },
  processorCapacity: { link: 2, bu: 12 },
  diskCapacity: { link: 3, bu: 11 },
  bpsCapacity: { link: 4, bu: 10 }
};

const resourceCount = 3;

const kaufmanRoberts = calculateSubsystemBlockingKaufmanRoberts(capacities, serviceClassConfigs);

console.log('kaufmanRoberts', kaufmanRoberts);
console.log('start lar');
const lar = calculateBlockingLAR(resourceCount, capacities, serviceClassConfigsLAR);
console.log('lar', lar);

const relationR = calculateBlockingRatios(kaufmanRoberts, lar);

console.log('start RLA');
const reducedLoadApproximation = processResultInRLA(capacities, serviceClasses);
console.log('reducedLoadApproximation', reducedLoadApproximation);
const Ei = calculateEi(relationR, reducedLoadApproximation);
console.log(Ei);
