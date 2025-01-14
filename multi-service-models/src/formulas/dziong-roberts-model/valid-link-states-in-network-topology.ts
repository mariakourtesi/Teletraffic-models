interface ServiceClass {
  serviceClass: number;
  lambda: number;
  mu: number;
  bandwidth: number;
  route: number[];
}

export const calculateValidStates = (
  topology: number[],
  serviceClasses: ServiceClass[]
): number[][] => {
  const validStates: number[][] = [];

  const maxCalls = serviceClasses.map((sc, idx) => {
    const minCapacity = Math.min(
      ...serviceClasses[idx].route.map((route, linkIdx) => {
        return topology[linkIdx] / (route * sc.bandwidth || 1);
      })
    );
    return Math.floor(minCapacity);
  });

  for (let n1 = 0; n1 <= maxCalls[0]; n1++) {
    for (let n2 = 0; n2 <= maxCalls[1]; n2++) {
      const state = [n1, n2];
      if (isValidState(state, topology, serviceClasses)) {
        validStates.push(state);
      }
    }
  }

  return validStates;
};

function isValidState(
  state: number[],
  topology: number[],
  serviceClasses: ServiceClass[]
): boolean {
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
}

const topology = [4, 5];
const serviceClasses: ServiceClass[] = [
  {
    serviceClass: 1,
    lambda: 1,
    mu: 1,
    bandwidth: 1,
    route: [1, 1]
  },
  {
    serviceClass: 2,
    lambda: 1,
    mu: 1,
    bandwidth: 2,
    route: [0, 1]
  }
];
