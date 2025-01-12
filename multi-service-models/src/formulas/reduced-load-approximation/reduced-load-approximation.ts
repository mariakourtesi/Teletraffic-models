import { kaufmanRoberts } from '../kaufman-roberts/kaufman-roberts-formula';
import { networkTopology, ServiceClassWithRoute } from '../types';

const initializeResult = (
  key: string,
  previousResult: { [key: string]: number },
  initialResult: number
): number => {
  return previousResult[key] !== undefined ? previousResult[key] : initialResult;
};

const calculateIncomingLoad = (
  serviceClass: ServiceClassWithRoute,
  link: networkTopology,
  result: { [key: string]: number },
  previousResult: { [key: string]: number },
  initialResult: number
): number => {
  const { route, incomingLoad_a, serviceClass: scId } = serviceClass;
  let updatedLoad = incomingLoad_a;

  route.forEach((otherLink) => {
    if (otherLink.link !== link.link) {
      const key = `V_link${otherLink.link}_class_${scId}`;
      const blockingProb = initializeResult(key, previousResult, initialResult);
      result[key] = blockingProb;
      updatedLoad *= 1 - blockingProb;
    }
  });
  return updatedLoad;
};

export const blockingProbabilityNetworkTopology = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[],
  previousResult: { [key: string]: number }
): { [key: string]: number } => {
  const result: { [key: string]: number } = {};
  const finalResult: { [key: string]: number } = {};
  const initialResult = 1;

  links.forEach((link) => {
    const newServiceClasses = serviceClasses
      .filter((sc) => sc.route.some((r) => r.link === link.link))
      .map((sc) => ({
        ...sc,
        bu: sc.route.find((r) => r.link === link.link)?.bu || 0,
        incomingLoad_a: calculateIncomingLoad(sc, link, result, previousResult, initialResult)
      }));

    let stateProbabilityValues;
    try {
      stateProbabilityValues = kaufmanRoberts(link.bu, newServiceClasses);
    } catch (error) {
      throw new Error(`Error in kaufmanRoberts calculation for link ${link.link}: ${error}`);
    }

    newServiceClasses.forEach((sc) => {
      let cumulativeBlockingProb = 0;
      const requested_bu = sc.bu;

      for (let j = link.bu - requested_bu + 1; j <= link.bu; j++) {
        const q_i = stateProbabilityValues[`q(${j})`] || 0;

        cumulativeBlockingProb += q_i;
      }

      finalResult[`V_link${link.link}_class_${sc.serviceClass}`] = cumulativeBlockingProb;
    });
  });

  return finalResult;
};

const calculateBlockingWithReducedTrafficLoad = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const THRESHOLD = 0.000001;
  const MAX_ITERATIONS = 1000;

  let currentResult = blockingProbabilityNetworkTopology(links, serviceClasses, {});
  const differenceCount: { [key: number]: number } = {};
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    const previousResult = { ...currentResult };
    currentResult = blockingProbabilityNetworkTopology(links, serviceClasses, previousResult);

    const maxDifference = Math.max(
      ...Object.keys(currentResult).map((key) =>
        Math.abs(currentResult[key] - (previousResult[key] || 0))
      )
    );

    if (maxDifference <= THRESHOLD) break;

    differenceCount[maxDifference] = (differenceCount[maxDifference] || 0) + 1;

    if (differenceCount[maxDifference] >= 2) {
      console.warn('Same difference occurred more than twice. Breaking the loop.');
      break;
    }
  }

  if (iterations >= MAX_ITERATIONS) {
    console.warn('Reached maximum iterations without convergence.');
  }

  console.log(`Number of iterations: ${iterations}`);
  return currentResult;
};

export const callBlockingProbabilityinRLA = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const blockingProbabilities = calculateBlockingWithReducedTrafficLoad(links, serviceClasses);
  const result: { [key: string]: number } = {};

  serviceClasses.forEach((sc) => {
    const { serviceClass, route } = sc;
    const totalBlockingProbability = route.reduce((cbp, link) => {
      const key = `V_link${link.link}_class_${serviceClass}`;
      return cbp * (1 - (blockingProbabilities[key] || 0));
    }, 1);

    result[`B${serviceClass}`] = +(1 - totalBlockingProbability).toFixed(5);
  });

  return result;
};

const link = [
  { link: 1, bu: 4 },
  { link: 2, bu: 5 }
];

const serviceClasses = [
  {
    serviceClass: 1,
    incomingLoad_a: 1,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 2 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 1,
    route: [{ link: 2, bu: 2 }]
  }
];

//console.log(callBlockingProbabilityinRLA(link, serviceClasses));

export const callBlockingProbabilityinRLAForProposedModel = (
  links: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): { [key: string]: number } => {
  const blockingProbabilities = calculateBlockingWithReducedTrafficLoad(links, serviceClasses);
  const logs: { [key: string]: number } = {};

  serviceClasses.forEach((sc) => {
    const { serviceClass, route } = sc;
    route.forEach((link) => {
      const key = `V_link${link.link}_class_${serviceClass}`;
      const value = blockingProbabilities[key];
      logs[key] = value;
    });
  });

  return logs;
};

const serciceClasses = [
  {
    serviceClass: 1,
    incomingLoad_a: 12.8,
    route: [
      { link: 1, bu: 1 },
      { link: 2, bu: 1 },
      { link: 3, bu: 1 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 2,
    incomingLoad_a: 6.4,
    route: [
      { link: 1, bu: 2 },
      { link: 2, bu: 2 },
      { link: 3, bu: 2 },
      { link: 4, bu: 2 }
    ]
  },
  {
    serviceClass: 3,
    incomingLoad_a: 3.2,
    route: [
      { link: 1, bu: 4 },
      { link: 2, bu: 4 },
      { link: 3, bu: 4 },
      { link: 4, bu: 2 }
    ]
  }
];

const links = [
  { link: 1, bu: 32 },
  { link: 2, bu: 24 },
  { link: 3, bu: 28 },
  { link: 4, bu: 40 }
];

//console.log(callBlockingProbabilityinRLAForProposedModel(links, serciceClasses));
