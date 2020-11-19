import { createMachine } from "./intCode.ts";

const program = await Deno.readTextFile("../input/day_nine.in").then((res) =>
  res.split(",").map(Number)
);

/**
 * Part One
 */

const machineA = createMachine(program, 1);

await machineA.run();

console.log("Part One:", machineA.readOutput());
console.assert(4288078517 === machineA.readOutput(), "Answer is incorrect");

/**
 * Part Two
 */

await createMachine(program, 2)
  .run()
  .then((machine) => {
    console.log("Part Two:", machine.readOutput());
    console.assert(69256 === machine.readOutput(), "Answer is incorrect");
  });
