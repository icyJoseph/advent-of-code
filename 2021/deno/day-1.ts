const input = await Deno.readTextFile("./input/day-1.in");

const sum = (a: number, b: number) => a + b;

const data = input.split("\n").map(Number);

/**
 * Part One
 */

const deltas = data
  .reduce((prev: number[], curr, index, src) => {
    if (index === 0) return prev;
    return [...prev, curr > src[index - 1] ? 1 : 0];
  }, [])
  .filter((x: number) => x).length;

console.log("Part One:", deltas);

/**
 * Part Two
 */

const windowDeltas = data
  .reduce((prev: number[], _, index, src) => {
    if (index === 0) return prev;
    if (src.length - index < 3) return prev;

    const prevWindow = src.slice(index - 1, index + 2);
    const nextWindow = src.slice(index, index + 3);

    const prevSum = prevWindow.reduce(sum);
    const nextSum = nextWindow.reduce(sum);

    return [...prev, nextSum > prevSum ? 1 : 0];
  }, [])
  .filter((x: number) => x).length;

console.log("Part One:", windowDeltas);
