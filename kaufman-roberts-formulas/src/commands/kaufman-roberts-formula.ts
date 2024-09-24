import { ServiceClass } from '../types';
import { numberOfDigitsAfterDecimal } from '../utils';

export const unnormalisedKaufmanRobertsFormula = (
  capacity: number,
  serviceClasses: ServiceClass[]
): number[] => {
  if (serviceClasses.length === 0) return [];

  const results: number[] = [];

  const q = (j: number): number => {
    // Base case: q(0) = 1
    if (j === 0) {
      results[0] = 1;
      return 1;
    }
    if (j < 0) return 0;

    let sum = 0;
    for (const serviceClass of serviceClasses) {
      const { bu, incomingLoad_a } = serviceClass;
      sum += incomingLoad_a * bu * q(j - bu);
    }

    const result = (1 / j) * sum;

    results[j] = parseFloat(result.toFixed(numberOfDigitsAfterDecimal));

    return result;
  };

  for (let j = 0; j <= capacity; j++) {
    q(j);
  }

  return results;
};

export const calculateNormalizationConstant_G = (unormalizedProbabilities: number[]): number => {
  if (unormalizedProbabilities.length === 0) return 0;
  return unormalizedProbabilities.reduce((acc, curr) => acc + curr, 0);
};

export const normaliseProbabilityValues = (probabilities: number[]): number[] => {
  const sum = calculateNormalizationConstant_G(probabilities);
  return probabilities.map((probability) =>
    parseFloat((probability / sum).toFixed(numberOfDigitsAfterDecimal))
  );
};

export const kaufmanRoberts = (capacity: number, serviceClasses: ServiceClass[]) => {
  const startTime = performance.now();
  const probabilities = unnormalisedKaufmanRobertsFormula(capacity, serviceClasses);

  const result: { [key: string]: number } = {};

  normaliseProbabilityValues(probabilities).forEach((prob, index) => {
    return (result[`q(${index})`] = prob);
  });

  console.log(`Time taken to execute: ${performance.now() - startTime} milliseconds`);

  return result;
};
