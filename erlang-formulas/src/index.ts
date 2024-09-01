import { basicErlang } from "./erlang";
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the capacity: ', (capacityInput) => {
  const capacity = parseInt(capacityInput);

  rl.question('Enter the traffic load: ', (trafficLoadInput) => {
    const trafficLoad = parseInt(trafficLoadInput);

    const result = basicErlang(capacity, trafficLoad);
    console.log(`Erlang value: ${result}`);

    rl.close();
  });
});

// console.log(basicErlang(3, 2)); // 0.21052erl