import { normaliseProbabilityValues } from '../normalise-probabilities';
import { networkTopology, ServiceClassWithRoute } from '../types';
import { dziongRobertsFormula } from './dziong-roberts-formula';

export const normaliseProbabilitiesDziongRoberts = (
  topology: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const result: { [key: string]: number } = {};

  const unNormalisedProbabilities = dziongRobertsFormula(topology, serviceClasses);
  const probValues = Object.values(unNormalisedProbabilities);
  const probKeys = Object.keys(unNormalisedProbabilities);
  const normalisedProbabilities = normaliseProbabilityValues(probValues);

  normalisedProbabilities.forEach((prob, index) => {
    result[probKeys[index]] = prob;
  });

  return result;
};

export const CBPDziongRoberts = (
  topology: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const normalisedProb = normaliseProbabilitiesDziongRoberts(topology, serviceClasses);
  const stateKeys = Object.keys(normalisedProb);

  const blockingProbabilities: { [key: string]: number } = {};

  serviceClasses.forEach((sc) => {
    blockingProbabilities[`B_${sc.serviceClass}`] = 0;
  });

  stateKeys.forEach((stateKey) => {
    const stateValues = stateKey.match(/\d+/g)?.map(Number);
    if (!stateValues) return;

    serviceClasses.forEach((sc) => {
      const route = sc.route;
      let isBlocking = false;
      let link;

      for (let i = 0; i < route.length; i++) {
        const linkUsage = route[i];
        const linkId = linkUsage.link;
        const linkBuRequired = linkUsage.bu;
        const topologyLink = topology.find((t) => t.link === linkId);
        if (!topologyLink) continue;

        if (stateValues[i] + linkBuRequired > topologyLink.bu) {
          isBlocking = true;
          link = topologyLink.link;
          break;
        }
      }

      if (isBlocking) {
        blockingProbabilities[`B_${sc.serviceClass}`] += normalisedProb[stateKey];
      }
    });
  });

  return blockingProbabilities;
};

const topology: networkTopology[] = [
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

console.log(CBPDziongRoberts(topology, serviceClasses));
