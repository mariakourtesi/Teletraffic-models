import { binomialCoefficient } from './binomial-distribution';

export const possibleArrangements = (
  waysToArrangeX: number,
  kGroups: number,
  capacity: number
): number => {
  if (waysToArrangeX > kGroups * capacity) {
    return 0;
  }

  const maxNumbOfIterations = waysToArrangeX / (capacity + 1);

  console.log('iterations', maxNumbOfIterations);

  let possibleArrangements = 0;
  for (let i = 0; i <= maxNumbOfIterations; i++) {
    const possibleWays =
      Math.pow(-1, i) *
      binomialCoefficient(kGroups, i) *
      binomialCoefficient(waysToArrangeX + (kGroups - 1) - i * (capacity + 1), kGroups - 1);

    possibleArrangements += possibleWays;
  }

  return possibleArrangements;
};
