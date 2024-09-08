export interface ServiceClass {
  serviceClass: number;
  bu: number;
  incomingLoad_a: number;
}

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

    results[j] = parseFloat(result.toFixed(3));

    return result;
  };

  for (let j = 0; j <= capacity; j++) {
    q(j);
  }

  return results;
};

export const normaliseProbabilityValues = (probabilities: number[]): number[] => {
  if (probabilities.length === 0) return [];
  const sum = probabilities.reduce((acc, curr) => acc + curr, 0);

  return probabilities.map((probability) => parseFloat((probability / sum).toFixed(3)));
};

export const kaufmanRoberts = (capacity: number, serviceClasses: ServiceClass[]) => {
  const probabilities = unnormalisedKaufmanRobertsFormula(capacity, serviceClasses);

  const result: { [key: string]: number } = {};

  normaliseProbabilityValues(probabilities).forEach((prob, index) => {
    return (result[`q(${index})`] = prob);
  });

  return result;
};