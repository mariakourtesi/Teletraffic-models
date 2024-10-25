const factorial = (num: number): number => {
  if (num === 0) {
    return 1;
  }
  return num * factorial(num - 1);
};

const calculateBinomialCoefficient = (numOfTrials: number, numberOfSuccesses: number): number => {
  return factorial(numOfTrials) / (factorial(numberOfSuccesses) * factorial(numOfTrials - numberOfSuccesses));
};

const binomialDistribution = (numOfTrials: number, probability: number, numberOfSuccesses: number): number => {
  return calculateBinomialCoefficient(numOfTrials, numberOfSuccesses) * Math.pow(probability, numberOfSuccesses) * Math.pow(1 - probability, numOfTrials - numberOfSuccesses);
};

export const binomialDistributionRangeProbability = (numOfTrials: number, probability: number, minSuccesses: number, maxSuccesses: number): number => {
  let sum = 0;

  for (let i = minSuccesses; i <= maxSuccesses; i++) {
    sum += binomialDistribution(numOfTrials, probability, i);

  }
  return sum;
};
