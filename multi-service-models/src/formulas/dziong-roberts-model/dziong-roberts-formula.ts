import { NUMBER_OF_DIGITS_AFTER_DECIMAL } from '../../constants';
import { calculateValidLinkStates } from './valid-link-states-in-network-topology';
import { networkTopology, ServiceClassWithRoute } from '../types';

export const stateProbabilityNetworkTopology = (
  link: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  stateProbabilities: { [key: string]: number } = {},
  validStates: number[][],
  currentState: number[] = []
): { [key: string]: number } => {
  const stateKey = `q(${currentState.join(',')})`;

  if (stateProbabilities[stateKey] !== undefined) return stateProbabilities;

  if (currentState.some((x) => x < 0)) {
    stateProbabilities[stateKey] = 0;
    return stateProbabilities;
  }

  if (currentState.every((x) => x === 0)) {
    stateProbabilities[stateKey] = 1.0;
    return stateProbabilities;
  }

  let sum = 0;

  for (const serviceClass of serviceClasses) {
    const { incomingLoad_a, route } = serviceClass;

    for (let i = 0; i < route.length; i++) {
      const bandwidth = route[i].bu;
      if (bandwidth === 0) continue;

      const newState = [...currentState];
      let isValid = true;

      for (let j = 0; j < newState.length; j++) {
        const usage = route[j]?.bu ?? 0;
        newState[j] -= usage;
        if (newState[j] < 0) isValid = false;
      }
      if (!isValid) continue;

      // Check if new state is valid
      if (!validStates.some((s) => s.every((val, idx) => val === newState[idx]))) continue;

      const recursed = stateProbabilityNetworkTopology(
        link,
        serviceClasses,
        stateProbabilities,
        validStates,
        newState
      );

      const previousProbability = recursed[`q(${newState.join(',')})`] || 0;
      sum += incomingLoad_a * bandwidth * previousProbability;
    }
  }

  const j = currentState.reduce((a, b) => a + b, 0);
  const result = j > 0 ? (1 / j) * sum : 0;

  stateProbabilities[stateKey] = result;
  return stateProbabilities;
};

export const dziongRobertsFormula = (
  topology: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const validStates = calculateValidLinkStates(topology, serviceClasses);
  let stateProbabilities: { [key: string]: number } = {};

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

  const roundedProbabilities: { [key: string]: number } = {};
  for (const key in stateProbabilities) {
    roundedProbabilities[key] = parseFloat(
      stateProbabilities[key].toFixed(NUMBER_OF_DIGITS_AFTER_DECIMAL)
    );
  }

  return roundedProbabilities;
};

const topology = [
  { link: 1, bu: 4 },
  { link: 2, bu: 5 },
  { link: 3, bu: 6 }
];

const serviceClasses: ServiceClassWithRoute[] = [
  {
    serviceClass: 1,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 1 },
      { link: 3, bu: 1 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 0 },
      { link: 2, bu: 2 },
      { link: 3, bu: 2 }
    ]
  },
  {
    serviceClass: 3,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 0 },
      { link: 2, bu: 0 },
      { link: 3, bu: 1 }
    ]
  }
];

// console.log(dziongRobertsFormula(topology, serviceClasses));
