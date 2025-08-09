import { ServiceClass } from '../types';
import { callBlockingProbability } from './call-blocking-probability'; // FAR

import { blockingProbabilityLAR } from '../limited-available-resources-model/blocking-probability'; // LAR

const BLOCKING_THRESHOLD = 0.00002;

const trafficMultipliers: { [key: string]: number } = {
  veryLow: 0.5,
  low: 1,
  normal: 2,
  moderateSpike: 3,
  spike: 4,
  extremeBurst: 6
};

const scaleTraffic = (base: ServiceClass[], multiplier: number): ServiceClass[] => {
  return base.map((sc) => ({
    ...sc,
    incomingLoad_a: sc.incomingLoad_a * multiplier
  }));
};

const isCapacitySufficient = (capacity: number, serviceClasses: ServiceClass[]): boolean => {
  //const blockingProbs = callBlockingProbability(capacity, serviceClasses);
  const capacityPerResource = Math.floor(capacity / 2); // 2 distinct resources for LAR model
  const blockingProbsLAR = blockingProbabilityLAR(2, capacityPerResource, serviceClasses); //  2 distinct resources for LAR model
  console.log(`Blocking probabilities for capacity ${capacity}:`, blockingProbsLAR);
  return Object.values(blockingProbsLAR).every((prob) => prob < BLOCKING_THRESHOLD);
};

const findMinCapacity = (serviceClasses: ServiceClass[], low = 50, high = 2000): number => {
  let left = low;
  let right = high;
  let result = high;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (isCapacitySufficient(mid, serviceClasses)) {
      result = mid;
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return result;
};

const serviceClasses = [
  {
    serviceClass: 1,
    bu: 4,
    incomingLoad_a: 4
  },
  {
    serviceClass: 2,
    bu: 8,
    incomingLoad_a: 5
  },
  {
    serviceClass: 3,
    bu: 16,
    incomingLoad_a: 6
  }
];

const capacities: { [key: string]: number } = {};

for (const [state, multiplier] of Object.entries(trafficMultipliers)) {
  const scaledScenario = scaleTraffic(serviceClasses, multiplier);
  console.log(`Calculating capacity for ${state} traffic state with multiplier ${multiplier}`);
  console.log('Scaled Service Classes:', scaledScenario);
  capacities[state] = findMinCapacity(scaledScenario);
}

console.log('Capacities for traffic states:', capacities);

// const result = callBlockingProbability(capacity, serviceClasses);
// console.log('Result:', result);
//console.log('Link Utilization:', calculateLinkUtilization(capacity, serviceClasses));
// console.log(
//   'Link Utilization in percentage:',
//   (Number(calculateLinkUtilization(capacity, serviceClasses)) / capacity) * 100
// );
