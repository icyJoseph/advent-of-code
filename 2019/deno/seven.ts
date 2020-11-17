import { createMemory, openPipe, closedPipe, stream } from "./intCode.ts";

const program = await Deno.readTextFile("../input/day_seven.in").then((res) =>
  res.split(",").map(Number)
);

const openLoopSettings = Array.from({ length: 43210 }, (_, i) => i + 1)
  .map((num) => (num > 10000 ? `${num}` : `0${num}`))
  .map((num) => new Set([...num.split("")].map(Number).filter((e) => e <= 4)))
  .filter((e) => e.size === 5)
  .map((e) => [...e]);

let max = 0;

for await (const setting of openLoopSettings) {
  const memories = Array.from({ length: 5 }, (_, index) =>
    createMemory(program, stream(setting[index]))
  );

  let next = await openPipe(memories)(0);

  if (next > max) {
    max = next;
  }
}

console.log("Part A:", max);

const closedLoopSettings = Array.from(
  { length: 100000 - 56789 },
  (_, i) => `${i + 56789}`
)
  .map((num) => new Set([...num.split("")].map(Number).filter((e) => e > 4)))
  .filter((e) => e.size === 5)
  .map((e) => [...e]);

let maxClosed = 0;

for await (const setting of closedLoopSettings) {
  const streams = Array.from({ length: 5 }, (_, index) => {
    if (index === 0) return stream(setting[index]);
    return stream(setting[index]);
  });

  const memories = Array.from({ length: 5 }, (_, index) =>
    createMemory(program, streams[index], streams[index === 4 ? 0 : index + 1])
  );

  let next = await closedPipe(memories)(0);

  if (next > maxClosed) {
    maxClosed = next;
  }
}

console.log("Part B:", maxClosed);
