import { unnormalisedLARModel } from './limited-available-resources-model';
import { ServiceClass } from '../types';
import {
  calculateNormalizationConstant_G,
  normaliseProbabilityValues
} from '../normalise-probabilities';

export const calculateLinkUtilization = (
  distinctResourceCount: number,
  individualResourceCapacity: number,
  serviceClasses: ServiceClass[]
): number => {
  const result: { [key: string]: number } = {};

  const probabilities: number[] = unnormalisedLARModel(
    distinctResourceCount,
    individualResourceCapacity,
    serviceClasses
  );
  console.log('Probabilities:', probabilities);

  normaliseProbabilityValues(probabilities).forEach((prob, index) => {
    result[`q(${index})`] = prob;
  });
  const capacity = distinctResourceCount * individualResourceCapacity;

  return Array.from({ length: capacity }, (_, j) => {
    const q_j = result[`q(${j + 1})`] || 0;
    return (j + 1) * q_j;
  }).reduce((sum, value) => sum + value, 0);
};

export const linkUtilization_U = (
  distinctResourceCount: number,
  capacity: number,
  serviceClasses: ServiceClass[]
): string => {
  const linkUtilization = calculateLinkUtilization(distinctResourceCount, capacity, serviceClasses);
  return `${linkUtilization.toFixed(7)} b.u`;
};
