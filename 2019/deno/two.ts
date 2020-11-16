import { createMemory } from "./intCode.ts";

const input = await Deno.readTextFile("../input/day_two.in").then((res) =>
  res.split(",").map(Number)
);

const memoryA = createMemory(input);

memoryA.writeAt(1, 12).writeAt(2, 2);

try {
  while (1) {
    memoryA.tick();
  }
} catch (e) {
  console.log(e);
} finally {
  console.log("Part A:", memoryA.readAt(0));
}

const target = 19690720;
let result = 0;

for (const noun of Array.from({ length: 100 }, (_, i) => i)) {
  for (const verb of Array.from({ length: 100 }, (_, i) => i)) {
    const memoryB = createMemory(input);

    memoryB.writeAt(1, noun).writeAt(2, verb);

    try {
      while (1) {
        memoryB.tick();
      }
    } catch (e) {
    } finally {
      result = memoryB.readAt(0);

      if (result === target) {
        console.log("Part B:", 100 * noun + verb);
        break;
      }
    }
  }
}
