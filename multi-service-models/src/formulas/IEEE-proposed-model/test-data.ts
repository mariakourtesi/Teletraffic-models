// data for testing
//TODO: move to test folder and add tests
import { calculateBlockingLAR, calculateBlockingRatios, calculateEi, calculateSubsystemBlockingKaufmanRoberts, processResultInRLA } from './proposed-model';
import { Capacities, ServiceClassConfigs } from './types';

const capacities: Capacities = {
  ramCapacity: 10,
  processorCapacity: 12,
  diskCapacity: 11,
  bpsCapacity: 10
};

const serviceClassConfigsKaufmanRoberts: ServiceClassConfigs = {
  serviceClasses: [
    {
      serviceClass: 1,
      incomingLoad_a: 3,
      bu: 1
    },
    {
      serviceClass: 2,
      incomingLoad_a: 1.5,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 1,
      bu: 3
    }
  ],
  serviceClassesBitrate: [
    {
      serviceClass: 1,
      incomingLoad_a: 3,
      bu: 2
    },
    {
      serviceClass: 2,
      incomingLoad_a: 1.5,
      bu: 2
    },
    {
      serviceClass: 3,
      incomingLoad_a: 1,
      bu: 2
    }
  ]
};

const serviceClassConfigsLAR: ServiceClassConfigs = {
  serviceClasses: [
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
  serviceClassesBitrate: [
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


const links = [
  { link: 1, capacity: 10 },
  { link: 2, capacity: 12 },
  { link: 3, capacity: 11 },
  { link: 4, capacity: 10 }
];

const serviceClasses = [
  {
    serviceClass: 1,
    incomingLoad_a: 3,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 1 },
      { link: 3, bu: 1 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 1.5,
    route: [
      { link: 1, bu: 2 },
      { link: 2, bu: 2 },
      { link: 3, bu: 2 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 3,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 3 },
      { link: 2, bu: 3 },
      { link: 3, bu: 3 },
      { link: 4, bu: 2 }
    ]
  }
];



const kaufmanRoberts = calculateSubsystemBlockingKaufmanRoberts(capacities, serviceClassConfigsKaufmanRoberts);
const lar = calculateBlockingLAR(3, capacities, serviceClassConfigsLAR);
const relationR = calculateBlockingRatios(kaufmanRoberts, lar);
const reducedLoadApproximation = processResultInRLA(links, serviceClasses);
const Ei = calculateEi(relationR, reducedLoadApproximation);