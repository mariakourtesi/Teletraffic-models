import { ServiceClass } from '../types';
import { numberOfDigitsAfterDecimal } from '../utils';
import { kaufmanRoberts } from './kaufman-roberts-formula';

const calculateLinkUtilization = (capacity: number, serviceClasses: ServiceClass[]): number => {
  const probabilities = kaufmanRoberts(capacity, serviceClasses);

  return Array.from({ length: capacity }, (_, j) => {
    const q_j = probabilities[`q(${j + 1})`];
    return (j + 1) * q_j;
  }).reduce((sum, value) => sum + value, 0);
};

export const linkUtilization_U = (capacity: number, serviceClasses: ServiceClass[]): string => {
  const linkUtilization = calculateLinkUtilization(capacity, serviceClasses);
  return `${linkUtilization.toFixed(7)} b.u`;
};

export const trunkEficiency_n = (capacity: number, serviceClasses: ServiceClass[]): string => {
  const utilization_G = calculateLinkUtilization(capacity, serviceClasses);
  return `${((utilization_G / capacity) * 100).toFixed(numberOfDigitsAfterDecimal)}%`;
};
