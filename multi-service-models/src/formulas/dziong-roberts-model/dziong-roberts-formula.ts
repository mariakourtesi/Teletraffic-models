import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from '../../constants';
import { calculateValidLinkStates } from './valid-link-states-in-network-topology';
import { networkTopology, ServiceClassWithRoute } from '../types';

export const stateProbabilityNetworkTopology = (
  link: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  stateProbabilities: { [key: string]: number } = {},
  validLinkStates: number[][]
): { [key: string]: number } => {
  const topologyKey = `q(${link.join(',')})`;

  // Check if this state has already been computed
  if (stateProbabilities[topologyKey] !== undefined) {
    return stateProbabilities;
  }

  // Base case: if all link capacities are zero
  if (link.every((link) => link.capacity === 0)) {
    stateProbabilities[topologyKey] = 1.0; // q(0,...,0) = 1
    return stateProbabilities;
  }

  // If any link has a negative capacity, the state is invalid
  if (link.some((link) => link.capacity < 0)) {
    stateProbabilities[topologyKey] = 0;
    return stateProbabilities;
  }

  let sum = 0;

  // Iterate over the links in the topology
  link.forEach((link, index) => {
    // Iterate over the service classes
    for (const serviceClass of serviceClasses) {
      const { incomingLoad_a, route } = serviceClass;
      const bandwidth = route[index].bu;

      if (route[index].bu === 0) continue; // Skip if the service class doesn't use this link

      if (link.bu >= 0) {
        const recursedProbabilities = stateProbabilityNetworkTopology(
          topology,
          serviceClasses,
          stateProbabilities,
          validLinkStates
        );
        const recursedKey = `q(${topology.join(',')})`;

        const recursedProbability = recursedProbabilities[recursedKey];

        sum += incomingLoad_a * bandwidth * recursedProbability;

        // if (jl > 0) {
        //   const result = (1 / jl) * sum;

        //   stateProbabilities[topologyKey] = parseFloat(result.toFixed(numberOfDigitsAfterDecimal));
        // }
      }
    }
  });

  return stateProbabilities;
};

const findValidKeys = (
  stateValues: { [key: string]: number },
  validStates: number[][]
): { [key: string]: number } => {
  const validKeys: { [key: string]: number } = {};

  for (const key in stateValues) {
    const matches = key.match(/\d+/g);
    if (matches) {
      const arrayKey = matches.map(Number);

      const existsInValidStates = validStates.some(
        (validState) =>
          validState.length === arrayKey.length &&
          validState.every((val, index) => val === arrayKey[index])
      );

      if (existsInValidStates) {
        validKeys[key] = stateValues[key];
      }
    }
  }

  return validKeys;
};

export const dziongRobertsFormula = (
  topology: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const validLinkStates: number[][] = [];
  const validStates = calculateValidLinkStates(topology, serviceClasses);
  validStates.forEach((state) => {
    const n1 = state[0];
    const n2 = state[1];

    const linkState: number[] = [];

    // Calculate the valid link state based on the number of calls for each service class
    linkState.push(n1);
    linkState.push(n1 + 2 * n2);

    validLinkStates.push(linkState);
  });

  const stateProbabilities = stateProbabilityNetworkTopology(
    topology,
    serviceClasses,
    {},
    validLinkStates
  );

  const validStatesinLink = findValidKeys(stateProbabilities, validLinkStates);
  return validStatesinLink;
};

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

// console.log(dziongRobertsFormula(topology, serviceClasses));
