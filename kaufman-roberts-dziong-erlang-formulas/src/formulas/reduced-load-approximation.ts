import { networkTopology, ServiceClassWithRoute } from '../types';
import { kaufmanRoberts } from './kaufman-roberts-formula';

const initializeResult = (
  key: string,
  previousResult: { [key: string]: number },
  initialResult: number
) => previousResult[key] !== undefined ? previousResult[key] : initialResult;

const calculateIncomingLoad = (
  serviceClass: ServiceClassWithRoute,
  link_in_network: networkTopology,
  result: { [key: string]: number },
  previousResult: { [key: string]: number },
  initialResult: number
) => {
  const { route, incomingLoad_a } = serviceClass;
  let updatedLoad = incomingLoad_a;
  route.forEach((link) => {
    if (link !== link_in_network.link) {
      const key = `V_link${link}_class_${serviceClass.serviceClass}`;
      result[key] = initializeResult(key, previousResult, initialResult);
      updatedLoad *= (1 - result[key]);
    }
  });
  return updatedLoad;
};

export const blockingProbabilityNetworkTopology = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  previousResult: { [key: string]: number }
): { [key: string]: number } => {
  const result: { [key: string]: number } = {};
  const finalResult: { [key: string]: number } = {};
  const initialResult = 1;

  links.forEach((link) => {
    const newServiceClasses = serviceClasses
      .filter(sc => sc.route.includes(link.link))
      .map(sc => ({
        ...sc,
        incomingLoad_a: calculateIncomingLoad(sc, link, result, previousResult, initialResult),
      }));

    const stateProbabilityValues = kaufmanRoberts(link.capacity, newServiceClasses);
    let cbp = 0;

    newServiceClasses.forEach((sc) => {
      const j = link.capacity - sc.bu + 1;
      const q_j = stateProbabilityValues[`q(${j})`] || 0;
      cbp += q_j;

      finalResult[`V_link${link.link}_class_${sc.serviceClass}`] = cbp;
    });
  });

  return finalResult;
};

const links: networkTopology[] = [
  { link: 1, capacity: 2 },
  { link: 2, capacity: 3 },
  { link: 3, capacity: 4 },
  { link: 4, capacity: 5 }
];

const serviceClasses: ServiceClassWithRoute[] = [
  { serviceClass: 1, bu: 1, incomingLoad_a: 1, route: [1, 2, 3, 4] },
  { serviceClass: 2, bu: 2, incomingLoad_a: 1, route: [2, 3] },
  { serviceClass: 2, bu: 2, incomingLoad_a: 1, route: [3, 4] }
];

const calculateBlockingWithReducedTrafficLoad = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const threshold = 0.0000001;
  let currentResult = blockingProbabilityNetworkTopology(links, serviceClasses, {});
  let difference: number;

  do {
    const previousResult = { ...currentResult };
    currentResult = blockingProbabilityNetworkTopology(links, serviceClasses, previousResult);
    difference = Math.max(
      ...Object.keys(currentResult).map(
        key => Math.abs(currentResult[key] - (previousResult[key] || 0))
      )
    );
  } while (difference > threshold);

  return currentResult;
};

export const callBlockingProbabilityinRLA = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const blockingProbabilities = calculateBlockingWithReducedTrafficLoad(links, serviceClasses);
  const result: { [key: string]: number } = {};

  serviceClasses.forEach((sc) => {
    const { serviceClass, route } = sc;
    const totalBlockingProbability = route.reduce((cbp, link) => {
      const key = `V_link${link}_class_${serviceClass}`;
      return cbp * (1 - (blockingProbabilities[key] || 0));
    }, 1);

    result[`B${serviceClass}`] = +(1 - totalBlockingProbability).toFixed(5);
  });

  return result;
};

console.log(callBlockingProbabilityinRLA(links, serviceClasses));
