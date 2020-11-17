import { createMemory } from "./intCode.ts";

const input = await Deno.readTextFile("../input/day_five.in").then((res) =>
  res.split(",").map(Number)
);

const memoryA = createMemory(input);

memoryA.setInput(1);

await memoryA.tick();

console.log("Part A:", memoryA.readOutput());

const memoryB = createMemory(input);

memoryB.setInput(5);

await memoryB.tick();

console.log("Part B:", memoryB.readOutput());
