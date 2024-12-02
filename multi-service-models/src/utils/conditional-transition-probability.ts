import { possibleArrangements } from './possible-arrangements';

export const conditionalTransitionProbability = (
  currentState: number,
  classCapacity: number,
  groupCount: number,
  totalCapacity: number
) => {
  const availableArrangements = (groupCount * totalCapacity) - currentState;
  const adjustedClassCapacity = classCapacity - 1;

  const nominator = possibleArrangements(availableArrangements, groupCount, adjustedClassCapacity);
  const denominator = possibleArrangements(availableArrangements, groupCount, totalCapacity);

  return 1 - (nominator / denominator);
};
