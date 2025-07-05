import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from '../../constants';
import { calculateValidLinkStates } from './valid-link-states-in-network-topology';
import { networkTopology, ServiceClassWithRoute } from '../types';

export const stateProbabilityNetworkTopology = (
  link: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  stateProbabilities: { [key: string]: number } = {},
  validStates: number[][],
  state_j: number[] = []
): { [key: string]: number } => {
  const topologyKey = `q(${state_j.join(',')})`;

  // Check if this state has already been computed
  if (stateProbabilities[topologyKey] !== undefined) {
    return stateProbabilities;
  }

  // Ignore states where any element is negative
  if (state_j.some((state) => state < 0)) {
    stateProbabilities[topologyKey] = 0;
    return stateProbabilities;
  }

  // Base case: q(0,0,...,0) = 1
  if (state_j.every((state) => state === 0)) {
    stateProbabilities[topologyKey] = 1.0;
    return stateProbabilities;
  }

  let sum = 0;
  let j_l = 0;

  // Iterate over the links in the topology
  link.forEach((link, index) => {
    j_l = state_j[index];
    console.log('link', link);

    // Iterate over the service classes
    for (const serviceClass of serviceClasses) {
      const { incomingLoad_a, route } = serviceClass;
      const bandwidth = route[index].bu;

      console.log('serviceClass', serviceClass.serviceClass);
      console.log('bandwidth:', bandwidth, 'link', link.link);

      if (bandwidth === 0) continue; // Skip if the service class doesn't use this link

      // Calculate new state for recursion
      const newState = state_j.map((current, i) => {
        return Math.max(current - bandwidth, 0); // Ensure non-negative states
      });

      // Recursive call to compute the probability for this new state
      const recursedProbabilities = stateProbabilityNetworkTopology(
        [link],
        serviceClasses,
        stateProbabilities,
        validStates,
        newState
      );

      const recursedProbability = recursedProbabilities[`q(${newState.join(',')})`] || 0;

      sum += incomingLoad_a * bandwidth * recursedProbability;
    }
  });

  const result = j_l > 0 ? (1 / j_l) * sum : 0;
  stateProbabilities[topologyKey] = result;

  return stateProbabilities;
};

export const dziongRobertsFormula = (
  topology: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const validStates = calculateValidLinkStates(topology, serviceClasses);
  let stateProbabilities: { [key: string]: number } = {};

  console.log('Valid states:', validStates);

  validStates.forEach(
    (state) =>
      (stateProbabilities = stateProbabilityNetworkTopology(
        topology,
        serviceClasses,
        stateProbabilities,
        validStates,
        state
      ))
  );

  return stateProbabilities;
};

// Example data
const topology = [
  { link: 1, bu: 4 },
  { link: 2, bu: 5 }
];

const serviceClasses: ServiceClassWithRoute[] = [
  {
    serviceClass: 1,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 1 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 0 },
      { link: 2, bu: 2 }
    ]
  }
];

console.log(dziongRobertsFormula(topology, serviceClasses));
