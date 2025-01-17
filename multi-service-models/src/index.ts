#! /usr/bin/env node
import { Command } from 'commander';
import figlet from 'figlet';
import kaufmanRoberts from './commands/kaufman-roberts';

console.log(figlet.textSync('EMLM'));

export async function execute(args: string[], exitFunction: (code: number) => void) {
  const program = new Command();
  program
    .version('0.0.1')
    .description(
      'A collection of formulas for calculating blocking probabilities in various networks'
    );
  program.addCommand(kaufmanRoberts());

  program.exitOverride();
  try {
    await program.parseAsync(args);
  } catch (error) {
    console.error(error);
    exitFunction(1);
  }
}

(async () =>
  await execute(process.argv, (code) => {
    process.exit(code);
  }))();
