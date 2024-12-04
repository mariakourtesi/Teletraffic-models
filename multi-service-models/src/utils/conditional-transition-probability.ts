import { possibleArrangements } from './possible-arrangements';

export const conditionalTransitionProbability = (
  currentState: number,
  requiredAllocationUnitsForClass: number,
  distinctResourceCount: number,
  individualResourceCapacity: number
) => {
  const availableArrangements = (distinctResourceCount * individualResourceCapacity) - currentState;
  const adjustedClassCapacity = requiredAllocationUnitsForClass - 1;

  const nominator = possibleArrangements(availableArrangements, distinctResourceCount, adjustedClassCapacity);
  const denominator = possibleArrangements(availableArrangements, distinctResourceCount, individualResourceCapacity);

  return 1 - (nominator / denominator);
};
