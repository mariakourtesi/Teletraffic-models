import { basicErlangB } from './erlang';
import { recurrentErlangformula } from './recurrent-erlang';
import * as readline from 'readline';

const calculatePerformance = (
  capacity: number,
  trafficLoad: number,
  formula: string
): void => {
  const startTime = performance.now();
  const formulaFunctions: { [key: string]: (capacity: number, trafficLoad: number) => number } = {
    R: recurrentErlangformula,
    B: basicErlangB,
  };

  const computeFormula = formulaFunctions[formula] || formulaFunctions.basicErlang;
  const result = computeFormula(capacity, trafficLoad);

  console.log(`Erlang value: ${result}`);
  console.log(`Time taken to execute Erlang-B formula: ${performance.now() - startTime} milliseconds`);
};


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the capacity: ', (capacityInput) => {
  const capacity = parseInt(capacityInput);

  rl.question('Enter the traffic load: ', (trafficLoadInput) => {
    const trafficLoad = parseInt(trafficLoadInput);
    rl.question(
      'Which Erlang formula do you want to use? (basicErlang [Insert B] or recurrentErlang [Insert R]): ',
      (erlangFormula) => {
        const formula = erlangFormula.toUpperCase();
        calculatePerformance(capacity, trafficLoad, formula);

        rl.close();
      }
    );
  });
});

