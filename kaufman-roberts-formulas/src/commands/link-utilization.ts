import { ServiceClass } from '../types';
import { kaufmanRoberts } from './kaufman-roberts-formula';

export const linkUtilization_U = (capacity: number, serviceClasses: ServiceClass[]): string => {
  const probabilities = kaufmanRoberts(capacity, serviceClasses);

  const result = Array.from({ length: capacity }, (_, j) => {
    const q_j = probabilities[`q(${j + 1})`];
    console.log(q_j);
    return (j + 1) * q_j;
  }).reduce((sum, value) => sum + value, 0);

  return `${result.toFixed(7)} b.u`;
};
