import { ServiceClass } from '../types';

import { callBlockingProbability } from '../kaufman-roberts/call-blocking-probability';
import { calculateLinkUtilization } from '../kaufman-roberts/link-utilization';

const CBP_THRESHOLD = 0.0002;

export const targetCBPSystemCapacityFAR = (
  capacity: number,
  serviceClasses: ServiceClass[]
): { [key: string]: number } => {
  let threshold = 0.1;

  while (threshold >= CBP_THRESHOLD) {
    const probabilities = callBlockingProbability(capacity, serviceClasses);
    const linkUtilization =
      (Number(calculateLinkUtilization(capacity, serviceClasses)) / capacity) * 100;
    // { B_class_1: 0.3143216, B_class_2: 0.5309898, B_class_3: 0.7821801 }
    threshold = Math.max(
      ...Object.values(probabilities).map((value) => parseFloat(value.toFixed(7)))
    );
    console.log('threshold:', threshold);

    console.log('probabilities:', probabilities);

    console.log('threshold:', threshold);
    if (threshold < CBP_THRESHOLD) {
      return {
        capacity: capacity,
        linkUtilization
      };
    }
    capacity += 10;
    serviceClasses.forEach((serviceClass) => {
      serviceClass.incomingLoad_a += 1;
    });
  }

  return {};
};

const capacity = 50;
const serviceClasses = [
  {
    serviceClass: 1,
    bu: 4,
    incomingLoad_a: 3
  },
  {
    serviceClass: 2,
    bu: 8,
    incomingLoad_a: 4
  },
  {
    serviceClass: 3,
    bu: 16,
    incomingLoad_a: 5
  }
];

const sysetmCapacity = targetCBPSystemCapacityFAR(capacity, serviceClasses);

console.log('System Capacity:', sysetmCapacity.capacity);
