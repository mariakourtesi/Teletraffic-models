import { ServiceClass } from '../../types';
import { conditionalTransitionProbability } from '../../utils/conditional-transition-probability';

const calculateOccupancyProbability = (
  currentState: number,
  distinctResourceCount: number,
  individualResourceCapacity: number,
  serviceClasses: ServiceClass[]
): number => {
  const results: number[] = [];
  // Base case: if the current state is zero, the probability is 1.
  if (currentState === 0) {
    return 1;
  }

  // Base case: if the current state is negative, the probability is 0.
  if (currentState < 0) {
    return 0;
  }

  let totalProbability = 0;

  for (const serviceClass of serviceClasses) {
    const { bu, incomingLoad_a } = serviceClass;

    const conditionalProbability = conditionalTransitionProbability(
      currentState - bu,
      bu,
      distinctResourceCount,
      individualResourceCapacity
    );

    const recursiveProbability = calculateOccupancyProbability(
      currentState - bu,
      distinctResourceCount,
      individualResourceCapacity,
      serviceClasses
    );

    totalProbability += incomingLoad_a * bu * conditionalProbability * recursiveProbability;
  }

  const result = (1 / currentState) * totalProbability;

  results[currentState] = result;

  return result;
};

export const unnormalisedLARModel = (
  distinctResourceCount: number,
  individualResourceCapacity: number,
  serviceClasses: ServiceClass[]
) => {
  if (serviceClasses.length === 0) return [];

  const results: number[] = [];

  const totalCapacity = distinctResourceCount * individualResourceCapacity;

  for (let i = 0; i <= totalCapacity; i++) {
    results[i] = calculateOccupancyProbability(
      i,
      distinctResourceCount,
      individualResourceCapacity,
      serviceClasses
    );
  }

  return results;
};

console.log(unnormalisedLARModel(2, 5, [{ serviceClass: 1, bu: 1, incomingLoad_a: 1 }]));
