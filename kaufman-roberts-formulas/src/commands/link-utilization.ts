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

export const meanNumberOfCallsInSystemInState_J = (
  capacity: number,
  serviceClasses: ServiceClass[],
  state_j: number
) => {
  const probabilities = kaufmanRoberts(capacity, serviceClasses);

  const meanNumberOfCalls: { [key: string]: number } = {};

  serviceClasses.forEach((serviceClass) => {
    const { bu, incomingLoad_a } = serviceClass;
    const y_j =
      incomingLoad_a * (probabilities[`q(${state_j - bu})`] / probabilities[`q(${state_j})`]);
    return (meanNumberOfCalls[`y_${serviceClass.serviceClass}(${state_j})`] = parseFloat(
      y_j.toFixed(2)
    ));
  });

  return meanNumberOfCalls;
};
