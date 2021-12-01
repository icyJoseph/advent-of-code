const input = await Deno.readTextFile("./input/day-1.in");

const sum = (a: number, b: number) => a + b;

const data = input.split("\n").map(Number);

/**
 * Part One
 */

const deltas = data
  .reduce((prev: boolean[], curr, index, src) => {
    if (index === 0) return prev;
    return [...prev, curr > src[index - 1]];
  }, [])
  .filter(Boolean).length;

console.log("Part One:", deltas);

/**
 * Part Two
 */

const windowDeltas = data
  .reduce((prev: boolean[], _, index, src) => {
    if (index < 3) return prev;

    return [...prev, src[index] > src[index - 3]];
  }, [])
  .filter(Boolean).length;

console.log("Part One:", windowDeltas);
