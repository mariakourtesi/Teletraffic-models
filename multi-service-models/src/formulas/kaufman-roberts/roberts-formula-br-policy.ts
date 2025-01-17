import { ServiceClassWithBR } from '../types';
import { normaliseProbabilityValues } from '../normalise-probabilities';
import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from '../../constants';

const stateProbablityWithBR_q = (
  j: number,
  serviceClasses: ServiceClassWithBR[],
  capacity: number
): number => {
  const results: number[] = [];
  // Base case: q(0) = 1
  if (j === 0) {
    results[0] = 1;
    return 1;
  }
  if (j < 0) return 0;

  let sum = 0;
  for (const serviceClass of serviceClasses) {
    const { incomingLoad_a, tk } = serviceClass;
    let bu = serviceClass.bu;
    if (j > capacity - tk) {
      bu = 0;
    }
    if (bu <= 0) {
      continue;
    }

    sum += incomingLoad_a * bu * stateProbablityWithBR_q(j - bu, serviceClasses, capacity);
  }

  const result = (1 / j) * sum;

  results[j] = parseFloat(result.toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL));

  return result;
};

export const robertsFormulaBRPolicy = (capacity: number, serviceClasses: ServiceClassWithBR[]) => {
  if (serviceClasses.length === 0) return {};

  const results: number[] = [];

  const probabilities: { [key: string]: number } = {};

  for (let j = 0; j <= capacity; j++) {
    results[j] = parseFloat(
      stateProbablityWithBR_q(j, serviceClasses, capacity).toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL)
    );
  }
  normaliseProbabilityValues(results).forEach((prob: number, index: number) => {
    return (probabilities[`q(${index})`] = prob);
  });

  return probabilities;
};
