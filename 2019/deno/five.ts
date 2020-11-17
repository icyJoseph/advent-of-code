import { createMemory } from "./intCode.ts";

const input = await Deno.readTextFile("../input/day_five.in").then((res) =>
  res.split(",").map(Number)
);

const memoryA = createMemory(input);

memoryA.setInput(1);

try {
  while (1) {
    memoryA.tick();
  }
} catch (e) {
  console.log(e);
} finally {
  console.log("Part A:", memoryA.readOutput());
}
