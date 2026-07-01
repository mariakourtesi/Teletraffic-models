import { networkTopology, ServiceClassWithRoute } from '../types';
import { normaliseProbabilitiesDziongRoberts } from './call-blocking-probability';

export const CBPDziongRoberts = (
  topology: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const normalisedProb = normaliseProbabilitiesDziongRoberts(topology, serviceClasses);
  const stateKeys = Object.keys(normalisedProb);

  const linkOrder = topology.map((t) => t.link);

  // init blocking map
  const blockingProbabilities: { [key: string]: number } = {};
  linkOrder.forEach((linkId) =>
    serviceClasses.forEach((sc) => {
      blockingProbabilities[`B_link${linkId}_class_${sc.serviceClass}`] = 0;
    })
  );
  serviceClasses.forEach((sc) => {
    blockingProbabilities[`B_class_${sc.serviceClass}_total`] = 0;
  });

  stateKeys.forEach((stateKey) => {
    const stateValues = stateKey.match(/-?\d+/g)?.map(Number);
    // require per-link state vector (this is the behavior that worked for 2x2)
    if (!stateValues || stateValues.length !== linkOrder.length) return;

    // map used BU per link
    const usedBU: Record<number, number> = {};
    linkOrder.forEach((linkId, i) => {
      usedBU[linkId] = stateValues[i] ?? 0;
    });

    const p = normalisedProb[stateKey] ?? 0;
    if (!isFinite(p) || p <= 0) return;

    serviceClasses.forEach((sc) => {
      let classBlocked = false;
      sc.route.forEach((hop) => {
        const linkId = hop.link;
        const cap = topology.find((t) => t.link === linkId)?.bu ?? 0;
        const used = usedBU[linkId] ?? 0;
        const req = hop.bu;
        if (used + req > cap) {
          blockingProbabilities[`B_link${linkId}_class_${sc.serviceClass}`] += p;
          classBlocked = true;
        }
      });
      if (classBlocked) {
        blockingProbabilities[`B_class_${sc.serviceClass}_total`] += p;
      }
    });
  });

  return blockingProbabilities;
};

const topology: networkTopology[] = [
  { link: 1, bu: 4 },
  { link: 2, bu: 5 }
  //   { link: 3, bu: 6 },
  //   { link: 4, bu: 7 }
];

const serviceClasses: ServiceClassWithRoute[] = [
  {
    serviceClass: 1,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 1 }
      //   { link: 3, bu: 1 },
      //   { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 0 },
      { link: 2, bu: 2 }
      //   { link: 3, bu: 2 },
      //   { link: 4, bu: 2 }
    ]
  }
  //   {
  //     serviceClass: 3,
  //     incomingLoad_a: 1,
  //     route: [
  //       { link: 1, bu: 1 },
  //       { link: 2, bu: 1 },
  //       { link: 3, bu: 1 },
  //       { link: 4, bu: 2 }
  //     ]
  //   },
  //   {
  //     serviceClass: 4,
  //     incomingLoad_a: 1,
  //     route: [
  //       { link: 1, bu: 1 },
  //       { link: 2, bu: 1 },
  //       { link: 3, bu: 1 },
  //       { link: 4, bu: 2 }
  //     ]
  //   }
];
console.log(CBPDziongRoberts(topology, serviceClasses));
