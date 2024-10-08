import { ServiceClassWithRoute } from '../types';
import { numberOfDigitsAfterDecimal } from '../utils';

export const stateProbabilityNetworkTopology = (
  topology: number[], 
  serviceClasses: ServiceClassWithRoute[], 
  stateProbabilities: { [key: string]: number } = {}
): { [key: string]: number } => {
  
  const topologyKey = `q(${topology.join(',')})`;
  
  // Check if this state has already been computed
  if (stateProbabilities[topologyKey] !== undefined) {
    return stateProbabilities;
  }

  // Base case: if all link capacities are zero, this is the final valid state
  if (topology.every(link => link === 0)) {
    stateProbabilities[topologyKey] = 1.0; // q(0,...,0) = 1
    return stateProbabilities;
  }

  // If any link has a negative capacity, this state is impossible
  if (topology.some(link => link < 0)) {
    stateProbabilities[topologyKey] = 0; 
    return stateProbabilities;
  }

  let sum = 0;

  // Iterate over the topology, processing each link
  for (let index = 0; index < topology.length; index++) {
    for (const serviceClass of serviceClasses) {
      const { route, incomingLoad_a, bu } = serviceClass;

      // Check if this service class traverses the current link
      if (route[index] !== 0) {
        const newTopology = [...topology]; // Clone the topology array

        // Reduce the capacity of the current link by bu
        newTopology[index] -= bu;

        // Ensure valid state (no negative capacities)
        if (newTopology[index] >= 0) {
          // Recursively calculate state probability for the reduced topology
          const recursedProbabilities = stateProbabilityNetworkTopology(newTopology, serviceClasses, stateProbabilities);
          const recursedKey = `q(${newTopology.join(',')})`;
          const recursedProbability = recursedProbabilities[recursedKey];

          sum += incomingLoad_a * bu * recursedProbability;
        }
      }
    }
  }

  const totalLinkCapacity = topology.reduce((a, b) => a + b, 0);
  const result = (1 / totalLinkCapacity) * sum;

  stateProbabilities[topologyKey] = parseFloat(result.toFixed(numberOfDigitsAfterDecimal));

  return stateProbabilities;
};

const topology = [4, 5]; 

const serviceClasses: ServiceClassWithRoute[] = [
  {
    serviceClass: 1,
    bu: 1,
    incomingLoad_a: 1,
    route: [1, 1], 
  },
  {
    serviceClass: 2,
    bu: 2, 
    incomingLoad_a: 1,
    route: [0, 2], 
  },
];

const result = stateProbabilityNetworkTopology(topology, serviceClasses);
console.log(result);
