import { calculateBlockingWithReducedTrafficLoad } from './reduced-load-approximation';
import { networkTopology, ServiceClassWithRoute } from '../types';

export const calculateLinkUtilization = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): Record<string, number> => {
  const stateProbabilities = calculateBlockingWithReducedTrafficLoad(links, serviceClasses);

  const probabilitiesLink = stateProbabilities.linkStateProbabilities;

  const utilizations = Object.entries(probabilitiesLink).map(([key, link]) => {
    const calculateLinkUtilization = link || 0;

    let sum = 0;
    for (let j = 0; j < Object.entries(calculateLinkUtilization).length; j++) {
      const q_j = calculateLinkUtilization[`q(${j + 1})`] || 0;

      sum += (j + 1) * q_j;
    }
    return { [`${key}`]: sum };
  });

  return Object.assign({}, ...utilizations);
};

export const linkUtilization_U = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): Record<string, string> => {
  const linkUtilization = calculateLinkUtilization(links, serviceClasses);
  const result: Record<string, string> = {};
  Object.entries(linkUtilization).forEach(([key, value]) => {
    const linkBu = links.find((link) => link.link === parseInt(key.split('_')[1]));

    const linkUtilizationPercentage = linkBu && linkBu.bu ? (value / linkBu.bu) * 100 : 0;

    result[key] = linkUtilizationPercentage.toFixed(2) + '%';
  });
  return result;
};

const links = [
  { link: 1, bu: 300 },
  { link: 2, bu: 300 }
];

const serviceClasses = [
  {
    serviceClass: 1,
    incomingLoad_a: 8,
    route: [
      { link: 1, bu: 4 },
      { link: 2, bu: 4 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 9,
    route: [
      { link: 1, bu: 8 },
      { link: 2, bu: 8 }
    ]
  },
  {
    serviceClass: 3,
    incomingLoad_a: 10,
    route: [
      { link: 1, bu: 16 },
      { link: 2, bu: 16 }
    ]
  }
];

console.log(linkUtilization_U(links, serviceClasses));
