import { createMachine, pipe, loop, createWire } from "./intCode.ts";

const program = await Deno.readTextFile("../input/day_seven.in").then((res) =>
  res.split(",").map(Number)
);

/**
 * Part One
 */

const openLoopSettings = Array.from({ length: 43210 }, (_, i) => i + 1)
  .map((num) => (num > 10000 ? `${num}` : `0${num}`))
  .map((num) => new Set([...num.split("")].map(Number).filter((e) => e <= 4)))
  .filter((e) => e.size === 5)
  .map((e) => [...e]);

let max = 0;

for await (const setting of openLoopSettings) {
  const machines = Array.from({ length: 5 }, (_, index) =>
    createMachine(program, createWire(setting[index]))
  );

  let next = await pipe(machines)(0);

  if (next > max) {
    max = next;
  }
}

console.log("Part One:", max);
console.assert(21760 === max, "Answer is incorrect");

/**
 * Part Two
 */

const closedLoopSettings = Array.from(
  { length: 100000 - 56789 },
  (_, i) => `${i + 56789}`
)
  .map((num) => new Set([...num.split("")].map(Number).filter((e) => e > 4)))
  .filter((e) => e.size === 5)
  .map((e) => [...e]);

let maxClosed = 0;

for await (const setting of closedLoopSettings) {
  const wires = Array.from({ length: 5 }, (_, index) => {
    if (index === 0) return createWire(setting[index]);
    return createWire(setting[index]);
  });

  const machines = Array.from({ length: 5 }, (_, index) =>
    createMachine(program, wires[index], wires[index === 4 ? 0 : index + 1])
  );

  let next = await loop(machines)(0);

  if (next > maxClosed) {
    maxClosed = next;
  }
}

console.log("Part Two:", maxClosed);
console.assert(69816958 === maxClosed, "Answer is incorrect");
