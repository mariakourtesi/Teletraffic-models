import { numberOfDigitsAfterDecimal } from '../../constants';
import { calculateValidStates } from './valid-link-states-in-network-topology';

//TODO: to revisit the tests and fix the formula

interface ServiceClass {
  serviceClass: number;
  lambda: number; // Arrival rate (in Erlangs)
  mu: number; // Service rate
  bandwidth: number; // Required bandwidth units (b.u.) for each call
  route: number[]; // Route: how many b.u. are used on each link
}

export const stateProbabilityNetworkTopology = (
  topology: number[],
  serviceClasses: ServiceClass[],
  stateProbabilities: { [key: string]: number } = {},
  validLinkStates: number[][]
): { [key: string]: number } => {
  const topologyKey = `q(${topology.join(',')})`;

  // Check if this state has already been computed
  if (stateProbabilities[topologyKey] !== undefined) {
    return stateProbabilities;
  }

  // Base case: if all link capacities are zero
  if (topology.every((link) => link === 0)) {
    stateProbabilities[topologyKey] = 1.0; // q(0,...,0) = 1
    return stateProbabilities;
  }

  // If any link has a negative capacity, the state is invalid
  if (topology.some((link) => link < 0)) {
    stateProbabilities[topologyKey] = 0;
    return stateProbabilities;
  }

  let sum = 0;

  // Iterate over the links in the topology
  for (let index = 0; index < topology.length; index++) {
    const jl = topology[index]; // Current link capacity

    // Iterate over the service classes
    for (const serviceClass of serviceClasses) {
      const { lambda, mu, bandwidth, route } = serviceClass;
      const incomingLoad_a = lambda / mu;

      if (route[index] === 0) continue; // Skip if the service class doesn't use this link

      const newTopology = [...topology];
      newTopology[index] -= bandwidth;

      if (newTopology[index] >= 0) {
        const recursedProbabilities = stateProbabilityNetworkTopology(
          newTopology,
          serviceClasses,
          stateProbabilities,
          validLinkStates
        );
        const recursedKey = `q(${newTopology.join(',')})`;

        const recursedProbability = recursedProbabilities[recursedKey];

        sum += incomingLoad_a * bandwidth * recursedProbability;
      }
    }

    if (jl > 0) {
      const result = (1 / jl) * sum;
      stateProbabilities[topologyKey] = parseFloat(result.toFixed(numberOfDigitsAfterDecimal));
    }
  }

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
  topology: number[],
  serviceClasses: ServiceClass[]
): { [key: string]: number } => {
  const validLinkStates: number[][] = [];
  const validStates = calculateValidStates(topology, serviceClasses);
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

const topology = [4, 5];

const serviceClasses: ServiceClass[] = [
  {
    serviceClass: 1,
    lambda: 1, // Arrival rate in Erlangs
    mu: 1, // Service rate
    bandwidth: 1, // Bandwidth units required per call
    route: [1, 1] // Uses both Link 1 and Link 2 (1 b.u. on each link)
  },
  {
    serviceClass: 2,
    lambda: 1,
    mu: 1,
    bandwidth: 2, // Requires 2 b.u. per call
    route: [0, 1] // Uses only Link 2 (2 b.u. on Link 2)
  }
];

// console.log(dziongRobertsFormula(topology, serviceClasses));
