import { networkTopology, ServiceClassWithRoute } from '../types';
import { kaufmanRoberts } from './kaufman-roberts-formula';

export const blockingProbabilityNetworkTopology = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  previousResult: { [key: string]: number }
): { [key: string]: number } => {
  const result: { [key: string]: number } = {};
  const finalResult: { [key: string]: number } = {};
  let initialResult = 1;

  links.forEach((link_in_network) => {
    let cbp = 0;
    let stateProbabilityValues;

    let newServiceClasses: ServiceClassWithRoute[] = [];
    const { capacity } = link_in_network;

    serviceClasses.forEach((serviceClass) => {
      const { route } = serviceClass;
      let incomingLoad_a = serviceClass.incomingLoad_a;
      let productForm = 1;

      if (route.includes(link_in_network.link)) {
        const linkMinusCurrentLink = route.filter((link) => link !== link_in_network.link);

        if (Object.keys(previousResult).length === 0) {
          result[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] =
            initialResult;
        } else {
          result[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] =
            previousResult[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`];
        }

        linkMinusCurrentLink.forEach((otherLinks) => {
          if (Object.keys(previousResult).length === 0) {
            result[`V_link${otherLinks}_class_${serviceClass.serviceClass}`] = initialResult;
          } else {
            result[`V_link${otherLinks}_class_${serviceClass.serviceClass}`] =
              previousResult[`V_link${otherLinks}_class_${serviceClass.serviceClass}`];
          }

          productForm *=( 1 - result[`V_link${otherLinks}_class_${serviceClass.serviceClass}`]);
          // productForm *= productForm;

          incomingLoad_a = incomingLoad_a * productForm;
        });

        const neWSC = {
          ...serviceClass,
          incomingLoad_a: incomingLoad_a
        };

        newServiceClasses.push(neWSC);
      }
    });

    stateProbabilityValues = kaufmanRoberts(capacity, newServiceClasses);

    newServiceClasses.forEach((serviceClass) => {
      const bu = serviceClass.bu;
      let j = capacity - bu + 1;
      const q_j = stateProbabilityValues[`q(${j})`] || 0;
      cbp += q_j;

      if (
        finalResult[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] ===
        undefined
      ) {
        finalResult[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] = cbp;
      }

      finalResult[`V_link${link_in_network.link}_class_${serviceClass.serviceClass}`] = cbp;
    });
  });

  return finalResult;
};

const links = [
  { link: 1, capacity: 2 },
  { link: 2, capacity: 3 }
];

const serviceClasses = [
  {
    serviceClass: 1,
    bu: 1,
    incomingLoad_a: 1,
    route: [1, 2]
  },
  {
    serviceClass: 2,
    bu: 2,
    incomingLoad_a: 1,
    route: [2]
  }
];

const calculateBlockingWithReducedTrafficLoad = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
) => {
  const predefinedValue = 0.0000001;

  let cbp: { [key: string]: number } = {};
  let previousCbp: { [key: string]: number } = {};
  let difference: number;

  // Initial calculation
  cbp = blockingProbabilityNetworkTopology(links, serviceClasses, {});

  do {
    previousCbp = { ...cbp };
    cbp = blockingProbabilityNetworkTopology(links, serviceClasses, previousCbp);

    // Calculate the maximum difference between current and previous values
    difference = Math.max(...Object.keys(cbp).map((key) => Math.abs(cbp[key] - previousCbp[key])));
  } while (difference > predefinedValue);

  return cbp;
};

export const callBlockingProbabilityinRLA = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
) => {
  const blockingProbabilities = calculateBlockingWithReducedTrafficLoad(links, serviceClasses);
  let result: { [key: string]: number } = {};

  serviceClasses.forEach((serviceClass) => {
    let cbp: number = 1;
    const { serviceClass: sc, route } = serviceClass;

    route.forEach((route) => {
      const linkBlockingProbability = blockingProbabilities[`V_link${route}_class_${sc}`] || 0;

      cbp *= 1 - linkBlockingProbability;
    });

    result[`B${sc}`] = Number((1 - cbp).toFixed(5));
  });

  return result;
};

console.log(callBlockingProbabilityinRLA(links, serviceClasses));
