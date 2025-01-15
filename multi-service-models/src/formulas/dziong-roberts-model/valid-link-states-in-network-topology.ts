import { networkTopology, ServiceClassWithRoute } from '../types';

export const calculateValidLinkStates = (
  topology: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): number[][] => {
  const validLinkStates: number[][] = [];

  const maxCalls = serviceClasses.map((serviceClass) => {
    const minCapacity = serviceClass.route
      .map((route) => {
        const link = topology.find((l) => l.link === route.link);
        return link ? link.bu / route.bu : 0;
      })
      .filter((value) => value > 0);
    return minCapacity.length > 0 ? Math.floor(Math.min(...minCapacity)) : 0;
  });

  const generateStates = (currentState: number[], depth: number) => {
    if (depth === serviceClasses.length) {
      const linkLoad = calculateLinkLoad(currentState, topology, serviceClasses);
      if (isValidLinkLoad(linkLoad, topology)) {
        validLinkStates.push(linkLoad);
      }
      return;
    }

    for (let calls = 0; calls <= maxCalls[depth]; calls++) {
      currentState[depth] = calls;
      generateStates(currentState, depth + 1);
    }
  };

  generateStates(Array(serviceClasses.length).fill(0), 0);

  return Array.from(new Set(validLinkStates.map((state) => JSON.stringify(state)))).map((state) =>
    JSON.parse(state)
  );
};

function calculateLinkLoad(
  state: number[],
  topology: networkTopology[],
  serviceClasses: ServiceClassWithRoute[]
): number[] {
  const linkLoad = Array(topology.length).fill(0);

  serviceClasses.forEach((serviceClass, scIdx) => {
    serviceClass.route.forEach((route) => {
      const linkIdx = topology.findIndex((link) => link.link === route.link);
      if (linkIdx >= 0) {
        linkLoad[linkIdx] += state[scIdx] * route.bu;
      }
    });
  });

  return linkLoad;
}

function isValidLinkLoad(linkLoad: number[], topology: networkTopology[]): boolean {
  return linkLoad.every((load, idx) => load <= topology[idx].bu);
}
