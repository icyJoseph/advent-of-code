import { createMemory } from "./intCode.ts";

const program = await Deno.readTextFile("../input/day_nine.in").then((res) =>
  res.split(",").map(Number)
);

/**
 * Part One
 */

const memory = createMemory(program, 1);

await memory.tick();

console.log("Part One:", memory.readOutput());

/**
 * Part Two
 */

await createMemory(program, 2)
  .tick()
  .then((mem) => console.log("Part Two:", mem.readOutput()));
