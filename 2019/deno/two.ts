import { createMemory } from "./intCode.ts";

const input = await Deno.readTextFile("../input/day_two.in").then((res) =>
  res.split(",").map(Number)
);

/**
 * Part One
 */

const memoryA = createMemory(input);

await memoryA.writeAt(1, 12).writeAt(2, 2).tick();

console.log("Part One:", memoryA.readAt(0));

/**
 * Part Two
 */

const target = 19690720;
let result = 0;

for await (const noun of Array.from({ length: 100 }, (_, i) => i)) {
  for await (const verb of Array.from({ length: 100 }, (_, i) => i)) {
    const memoryB = createMemory(input);

    await memoryB.writeAt(1, noun).writeAt(2, verb).tick();

    result = memoryB.readAt(0);

    if (result === target) {
      console.log("Part Two:", 100 * noun + verb);
      break;
    }
  }
}
