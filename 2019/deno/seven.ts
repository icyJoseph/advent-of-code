import { createMemory, pipe, stream } from "./intCode.ts";

const input = await Deno.readTextFile("../input/day_seven.in").then((res) =>
  res.split(",").map(Number)
);

const allPhaseSettings = Array.from({ length: 43210 }, (_, i) => i + 1)
  .map((num) => (num > 10000 ? `${num}` : `0${num}`))
  .map((num) => new Set([...num.split("")].map(Number).filter((e) => e <= 4)))
  .filter((e) => e.size === 5)
  .map((e) => [...e]);

let max = 0;

for await (const setting of allPhaseSettings) {
  const memories = Array.from({ length: 5 }, (_, index) =>
    createMemory(input, stream([setting[index]]))
  );

  let next = await pipe(memories)(0);

  if (next > max) {
    max = next;
  }
}

console.log("Part A:", max);
