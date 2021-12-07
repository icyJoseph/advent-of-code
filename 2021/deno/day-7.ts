const input = await Deno.readTextFile("./input/day-7.in");

const positions = input.split(",").map(Number);

const sorted = positions.sort((a, b) => a - b);

const length = sorted.length;

const median =
  length % 2 === 0
    ? Math.floor((sorted[length / 2] + sorted[length / 2 - 1]) / 2)
    : sorted[Math.floor(length / 2)];

const total = sorted.reduce((prev, curr) => {
  return prev + Math.abs(curr - median);
}, 0);

/**
 * Part One
 */
console.log("Part One:", total);

/**
 * Part Two
 */

const maxPos = Math.max(...positions);

let superTotal = Infinity;
let current = sorted[0];

while (current <= maxPos) {
  const next = sorted.reduce((prev, x) => {
    const diff = Math.abs(x - current);
    const accumulated = (diff * (diff + 1)) / 2;

    return prev + accumulated;
  }, 0);

  if (next < superTotal) {
    superTotal = next;
  }

  current += 1;
}

console.log("Part Two:", superTotal);
