import { ServiceClassWithRoute } from '../types';
import {
  calculateBlockingWithReducedTrafficLoad,
  callBlockingProbabilityinRLA
} from '../reduced-load-approximation/reduced-load-approximation';

const BLOCKING_THRESHOLD = 0.0002;

const trafficMultipliers: { [key: string]: number } = {
  veryLow: 0.5,
  low: 1,
  normal: 2,
  moderateSpike: 3,
  spike: 4,
  extremeBurst: 6
};

type NetworkTopology = { link: number; capacity: number };

const scaleTraffic = (
  base: ServiceClassWithRoute[],
  multiplier: number
): ServiceClassWithRoute[] => {
  return base.map((sc) => ({
    ...sc,
    incomingLoad_a: sc.incomingLoad_a * multiplier
  }));
};

const isCapacitySufficient = (
  capacity: number,
  serviceClasses: ServiceClassWithRoute[]
): boolean => {
  const linkSet = new Set<number>();
  serviceClasses.forEach((sc) => {
    sc.route.forEach((r) => linkSet.add(r.link));
  });

  const links: NetworkTopology[] = Array.from(linkSet).map((link) => ({
    link,
    capacity
  }));

  console.log(`Checking capacity: ${capacity} for service classes:`, serviceClasses);

  const blockingProbsLAR = callBlockingProbabilityinRLA(links, serviceClasses);

  return Object.values(blockingProbsLAR).every((prob) => prob < BLOCKING_THRESHOLD);
};

const findMinCapacity = (
  serviceClasses: ServiceClassWithRoute[],
  low = 50,
  high = 2000
): number => {
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
  console.log(`Minimum capacity found: ${result}`);
  return result;
};

// Test data
const serviceClasses: ServiceClassWithRoute[] = [
  {
    serviceClass: 1,
    incomingLoad_a: 4,
    route: [
      { link: 1, bu: 4 },
      { link: 2, bu: 4 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 5,
    route: [
      { link: 1, bu: 8 },
      { link: 2, bu: 8 }
    ]
  },
  {
    serviceClass: 3,
    incomingLoad_a: 6,
    route: [
      { link: 1, bu: 16 },
      { link: 2, bu: 16 }
    ]
  }
];

const capacities: { [key: string]: number } = {};

for (const [state, multiplier] of Object.entries(trafficMultipliers)) {
  const scaledScenario = scaleTraffic(serviceClasses, multiplier);
  console.log(`\nCalculating capacity for "${state}" traffic state (multiplier: ${multiplier})`);
  console.log('Scaled Service Classes:', JSON.stringify(scaledScenario, null, 2));
  capacities[state] = findMinCapacity(scaledScenario);
  console.log(`Minimum capacity for "${state}" traffic state: ${capacities[state]}`);
}

console.log('\nCapacities for each traffic state:\n', capacities);
