const input = await Deno.readTextFile("./input/01.in");

const data = input.split("\n\n").map((chunk) => chunk.split("\n").map(Number));

/**
 * Part One
 */
const sum = (a: number, b: number) => a + b;

const cals = data
  .reduce((prev, curr) => {
    const total = curr.reduce(sum);
    return [...prev, total];
  }, [])
  .sort((a, b) => b - a);

console.log("Part one:", cals[0]);

/**
 * Part Two
 */
console.log("Part two:", cals.slice(0, 3).reduce(sum));
