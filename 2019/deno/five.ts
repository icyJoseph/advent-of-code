import { createMachine } from "./intCode.ts";

const input = await Deno.readTextFile("../input/day_five.in").then((res) =>
  res.split(",").map(Number)
);

/**
 * Part One
 */
const machineA = createMachine(input);

await machineA.setInput(1).run();

console.log("Part One:", machineA.readOutput());
console.assert(12896948 === machineA.readOutput(), "Answer is incorrect");

/**
 * Part Two
 */

const machineB = createMachine(input);

await machineB.setInput(5).run();

console.log("Part Two:", machineB.readOutput());
console.assert(7704130 === machineB.readOutput(), "Answer is incorrect");
