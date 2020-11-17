import { createMemory } from "./intCode.ts";

const input = await Deno.readTextFile("../input/day_five.in").then((res) =>
  res.split(",").map(Number)
);

/**
 * Part One
 */
const memoryA = createMemory(input);

await memoryA.setInput(1).tick();

console.log("Part One:", memoryA.readOutput());

/**
 * Part Two
 */

const memoryB = createMemory(input);

await memoryB.setInput(5).tick();

console.log("Part Two:", memoryB.readOutput());
