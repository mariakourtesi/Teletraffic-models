import { ServiceClass } from '../types';
import { normaliseProbabilityValues, numberOfDigitsAfterDecimal } from '../utils';

const blockingProbablity_q = (j: number, serviceClasses: ServiceClass[]): number => {
  const results: number[] = [];
  // Base case: q(0) = 1
  if (j === 0) {
    results[0] = 1;
    return 1;
  }
  if (j < 0) return 0;

  let sum = 0;
  for (const serviceClass of serviceClasses) {
    const { bu, incomingLoad_a } = serviceClass;
    sum += incomingLoad_a * bu * blockingProbablity_q(j - bu, serviceClasses);
  }

  const result = (1 / j) * sum;

  results[j] = parseFloat(result.toFixed(numberOfDigitsAfterDecimal));

  return result;
};

export const unnormalisedKaufmanRobertsFormula = (
  capacity: number,
  serviceClasses: ServiceClass[]
): number[] => {
  if (serviceClasses.length === 0) return [];

  const results: number[] = [];

  for (let j = 0; j <= capacity; j++) {
    results[j] = parseFloat(
      blockingProbablity_q(j, serviceClasses).toFixed(numberOfDigitsAfterDecimal)
    );
  }

  return results;
};

export const kaufmanRoberts = (capacity: number, serviceClasses: ServiceClass[]) => {
  const probabilities = unnormalisedKaufmanRobertsFormula(capacity, serviceClasses);

  const result: { [key: string]: number } = {};

  normaliseProbabilityValues(probabilities).forEach((prob, index) => {
    return (result[`q(${index})`] = prob);
  });

  return result;
};