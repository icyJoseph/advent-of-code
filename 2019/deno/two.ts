import { createMachine } from "./intCode.ts";

const input = await Deno.readTextFile("../input/day_two.in").then((res) =>
  res.split(",").map(Number)
);

/**
 * Part One
 */

const machineA = createMachine(input);

await machineA.writeAt(1, 12).writeAt(2, 2).run();

console.log("Part One:", machineA.readAt(0));
console.assert(4570637 === machineA.readAt(0), "Answer is incorrect");

/**
 * Part Two
 */

const target = 19690720;
let result = 0;

for await (const noun of Array.from({ length: 100 }, (_, i) => i)) {
  for await (const verb of Array.from({ length: 100 }, (_, i) => i)) {
    const machineB = createMachine(input);

    await machineB.writeAt(1, noun).writeAt(2, verb).run();

    result = machineB.readAt(0);

    if (result === target) {
      const answer = 100 * noun + verb;
      console.log("Part Two:", answer);
      console.assert(5485 === answer, "Answer is incorrect");
      break;
    }
  }
}
