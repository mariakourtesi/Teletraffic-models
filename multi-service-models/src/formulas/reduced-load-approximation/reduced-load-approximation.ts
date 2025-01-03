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
  const threshold = 0.000001;
  let currentResult = blockingProbabilityNetworkTopology(links, serviceClasses, {});
  let difference: number;
  let iterations = 0;
  let previousDifference = Infinity;
  let sameDifferenceCount = 0;

  do {
    iterations++;
    const previousResult = { ...currentResult };

    currentResult = blockingProbabilityNetworkTopology(links, serviceClasses, previousResult);
    difference = Math.max(
      ...Object.keys(currentResult).map((key) =>
        Math.abs(currentResult[key] - (previousResult[key] || 0))
      )
    );

    if (difference === previousDifference) {
      sameDifferenceCount++;
    } else {
      sameDifferenceCount = 0;
    }

    previousDifference = difference;

    if (sameDifferenceCount >= 2) {
      break;
    }
  } while (difference >= threshold);

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
      console.log(key, blockingProbabilities[key]);
      return cbp * (1 - (blockingProbabilities[key] || 0));
    }, 1);

    result[`B${serviceClass}`] = +(1 - totalBlockingProbability).toFixed(5);
  });

  return result;
};

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
