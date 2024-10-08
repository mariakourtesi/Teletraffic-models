import { ServiceClassWithBR } from '../types';
import { numberOfDigitsAfterDecimal } from '../utils';
import { normaliseProbabilityValues } from '../utils';

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

  results[j] = parseFloat(result.toFixed(numberOfDigitsAfterDecimal));

  return result;
};

console.log(stateProbablityWithBR_q(3, [{ serviceClass: 1, bu: 1, incomingLoad_a: 2, tk: 1 }, {serviceClass: 2, bu:2, incomingLoad_a:1, tk:0}], 4));

export const robertsFormulaBRPolicy = (capacity: number, serviceClasses: ServiceClassWithBR[]) => {
  if (serviceClasses.length === 0) return {};

  const results: number[] = [];

  const probabilities: { [key: string]: number } = {};

  for (let j = 0; j <= capacity; j++) {
    results[j] = parseFloat(
      stateProbablityWithBR_q(j, serviceClasses, capacity).toFixed(numberOfDigitsAfterDecimal)
    );
  }
  normaliseProbabilityValues(results).forEach((prob: number, index: number) => {
    return (probabilities[`q(${index})`] = prob);
  });

  return probabilities;
};
