const factorial = (num: number): number => {
  if (num === 0) {
    return 1;
  }
  return num * factorial(num - 1);
};

const calculateProbabilityOfCalls = (load: number, capacity: number): number => {
  return Math.pow(load, capacity) / factorial(capacity);
};

const possibleStatesOfSystemSummation = (load: number, capacity: number): number => {
  let sum = 0;
  for (let i = 0; i <= capacity; i++) {
    sum += Math.pow(load, i) / factorial(i);
  }
  return sum;
};

export const basicErlang = (capacity: number, trafficLoad: number): number => {
 const  startTime = performance.now()
 const carriedTrafficLoad = calculateProbabilityOfCalls(trafficLoad, capacity) / possibleStatesOfSystemSummation(trafficLoad, capacity)
  const endTime = performance.now()
  console.log(`Time taken to execute Erlang-B formula: ${endTime - startTime} in milliseconds`)
  return carriedTrafficLoad;
};


