// Define the structure for a service class
interface ServiceClass {
  serviceClass: number; // Service class ID
  lambda: number; // Arrival rate (in Erlangs)
  mu: number; // Service rate
  bandwidth: number; // Required bandwidth units (b.u.) for each call
  route: number[]; // Route: how many b.u. are used on each link
}


// Define the function to calculate valid system states
export const  calculateValidStates= (
  topology: number[], // Capacities of each link
  serviceClasses: ServiceClass[] // List of service classes
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
}

// Helper function to check if the state is valid
function isValidState(
  state: number[], // Number of in-service calls for each service class
  topology: number[], // Capacities of each link
  serviceClasses: ServiceClass[] // Service class data
): boolean {
  const linkLoad = Array(topology.length).fill(0); // Track load on each link

  // Calculate the total load on each link based on the current state
  for (let i = 0; i < serviceClasses.length; i++) {
    const calls = state[i];
    const route = serviceClasses[i].route;
    const bandwidth = serviceClasses[i].bandwidth;

    // Add the load of service class `i` to each link it uses
    for (let linkIndex = 0; linkIndex < route.length; linkIndex++) {
      linkLoad[linkIndex] += calls * route[linkIndex] * bandwidth;
    }
  }

  // Ensure that the load on each link does not exceed its capacity
  for (let linkIndex = 0; linkIndex < topology.length; linkIndex++) {
    if (linkLoad[linkIndex] > topology[linkIndex]) {
      return false; // Invalid state if any link is overloaded
    }
  }

  return true; // The state is valid if all link capacities are respected
}


const isValidLinkState = (
  state: number[],
  serviceClasses: ServiceClass[],
  topology: number[]
): boolean => {
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
};


// // Test data

const topology = [4, 5]; // Link capacities: Link 1 has 2 b.u., Link 2 has 3 b.u.

const serviceClasses: ServiceClass[] = [
  {
    serviceClass: 1,
    lambda: 1, // Arrival rate in Erlangs
    mu: 1, // Service rate
    bandwidth: 1, // Bandwidth units required per call
    route: [1, 1], // Uses both Link 1 and Link 2 (1 b.u. on each link)
  },
  {
    serviceClass: 2,
    lambda: 1,
    mu: 1,
    bandwidth: 2, // Requires 2 b.u. per call
    route: [0, 1], // Uses only Link 2 (2 b.u. on Link 2)
  },
];

// // Calculate and log the valid states
// const validStates = calculateValidStates(topology, serviceClasses);
// console.log("Valid States:", validStates);

// const validLinkStates: number[][] = [];

// validStates.forEach((state) => {
//   const n1 = state[0];
//   const n2 = state[1];

//   let linkState: number[] = [];

//   // Calculate the valid link state based on the number of calls for each service class
//   linkState.push(n1);
//   linkState.push(n1 + 2 * n2);

//   validLinkStates.push(linkState);
// });

// console.log("Valid Link States:", validLinkStates);
