import { createMemory } from "./intCode.ts";

const input = await Deno.readTextFile("../input/day_five.in").then((res) =>
  res.split(",").map(Number)
);

const memoryA = createMemory(input);

await memoryA.setInput(1).tick();

console.log("Part A:", memoryA.readOutput());

const memoryB = createMemory(input);

await memoryB.setInput(5).tick();

console.log("Part B:", memoryB.readOutput());
