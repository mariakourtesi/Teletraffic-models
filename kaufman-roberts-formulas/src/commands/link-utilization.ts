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

  for (const serviceClass of serviceClasses) {
    const { bu, incomingLoad_a } = serviceClass;

    if (state_j < bu) {
      // set y_k(j) = 0 as per the condition
      meanNumberOfCalls[`y_${serviceClass.serviceClass}(${state_j})`] = 0;
      continue;
    }

    const prob_j_minus_bu = probabilities[`q(${state_j - bu})`];
    const prob_j = probabilities[`q(${state_j})`];

    if (prob_j_minus_bu === undefined || prob_j === undefined || prob_j === 0) {
      meanNumberOfCalls[`y_${serviceClass.serviceClass}(${state_j})`] = 0;
      continue;
    }

    const y_j = incomingLoad_a * (prob_j_minus_bu / prob_j);

    meanNumberOfCalls[`y_${serviceClass.serviceClass}(${state_j})`] = parseFloat(y_j.toFixed(2));
  }

  return meanNumberOfCalls;
};

export const meanNumberOfCallsInSystem = (capacity: number, serviceClasses: ServiceClass[]) => {
  const meanNumberOfCalls: { [key: string]: number } = {};
  const probabilities = kaufmanRoberts(capacity, serviceClasses);

  for (const serviceClass of serviceClasses) {
    meanNumberOfCalls[`n_${serviceClass.serviceClass}`] = 0;

    for (let j = 1; j <= capacity; j++) {
      const meanNumberOfCallsInEachState = meanNumberOfCallsInSystemInState_J(
        capacity,
        serviceClasses,
        j
      );

      meanNumberOfCalls[`n_${serviceClass.serviceClass}`] +=
        meanNumberOfCallsInEachState[`y_${serviceClass.serviceClass}(${j})`] *
        parseFloat(probabilities[`q(${j})`].toFixed(2));
    }
  }

  return meanNumberOfCalls;
};
