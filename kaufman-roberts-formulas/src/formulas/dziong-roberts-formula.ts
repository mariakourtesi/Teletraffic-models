import { ServiceClassWithRoute } from '../types';
import { numberOfDigitsAfterDecimal } from '../utils';
import { calculateValidStates } from './valid-link-states-in-network-topology';

interface ServiceClass {
  serviceClass: number; // Service class ID
  lambda: number; // Arrival rate (in Erlangs)
  mu: number; // Service rate
  bandwidth: number; // Required bandwidth units (b.u.) for each call
  route: number[]; // Route: how many b.u. are used on each link
}

const isValidLinkState = (
  state: number[],
  serviceClasses: ServiceClass[],
  topology: number[]
): boolean => {
  const linkLoad = Array(topology.length).fill(0);

  for (let i = 0; i < serviceClasses.length; i++) {
    const calls = state[i];
    const route = serviceClasses[i].route;
    const bandwidth = serviceClasses[i].bandwidth;

    for (let linkIndex = 0; linkIndex < route.length; linkIndex++) {
      linkLoad[linkIndex] += calls * route[linkIndex] * bandwidth;
    }
  }

  for (let linkIndex = 0; linkIndex < topology.length; linkIndex++) {
    if (linkLoad[linkIndex] > topology[linkIndex]) {
      return false;
    }
  }

  return true;
};

export const stateProbabilityNetworkTopology = (
  topology: number[],
  serviceClasses: ServiceClass[],
  newTopology: number[] = topology,
  stateProbabilities: { [key: string]: number } = {},
  validLinkStates: number[][]
): { [key: string]: number } => {
  const topologyKey = `q(${newTopology.join(',')})`;

  // Check if this state has already been computed
  if (stateProbabilities[topologyKey] !== undefined) {
    return stateProbabilities;
  }

  // Base case: if all link capacities are zero, this is the final valid state
  if (newTopology.every((link) => link === 0)) {
    stateProbabilities[topologyKey] = 1.0; // q(0,...,0) = 1
    return stateProbabilities;
  }

  // If any link has a negative capacity
  if (newTopology.some((link) => link < 0)) {
    stateProbabilities[topologyKey] = 0;
    return stateProbabilities;
  }

  let sum = 0;

  // Iterate over the topology, processing each link
  for (let index = 0; index < newTopology.length; index++) {
    for (const serviceClass of serviceClasses) {
      const { lambda, mu, bandwidth } = serviceClass;
      const incomingLoad_a = lambda / mu;
      const newTopologyLink = [...newTopology];
      newTopologyLink[index] -= bandwidth;

      const isValidState = validLinkStates.some((validLinkState) =>
        newTopologyLink.every((value, index) => value === validLinkState[index])
      );

      console.log('isValidState?', newTopologyLink, isValidState);

      if (isValidState) {
        const probabilityKey = `q(${newTopologyLink.join(',')})`;
        const probability = stateProbabilityNetworkTopology(
          newTopologyLink,
          serviceClasses,
          topology,
          stateProbabilities,
          validLinkStates
        );

        sum += incomingLoad_a * bandwidth * probability[probabilityKey];
      }
    }
  }
  const totalLinkCapacity = topology.reduce((a, b) => a + b, 0);
  const result = (1 / totalLinkCapacity) * sum;
  stateProbabilities[topologyKey] = parseFloat(result.toFixed(numberOfDigitsAfterDecimal));
  return stateProbabilities;
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

    let linkState: number[] = [];

    // Calculate the valid link state based on the number of calls for each service class
    linkState.push(n1);
    linkState.push(n1 + 2 * n2);

    validLinkStates.push(linkState);
  });

  const stateProbabilities = stateProbabilityNetworkTopology(
    topology,
    serviceClasses,
    topology,
    {},
    validLinkStates
  );
  return stateProbabilities;
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

console.log(dziongRobertsFormula(topology, serviceClasses));
