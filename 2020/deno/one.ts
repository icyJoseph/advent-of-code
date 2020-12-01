const input = await Deno.readTextFile("./input/one.in").then((res) =>
  res.split("\n").map(Number)
);

/**
 * Helpers
 */
const findComplement = (target: number, arr: number[]): number[] => {
  const set = new Set(arr);

  return arr.map((x) => target - x).filter((x) => set.has(x));
};

/**
 * Part One
 */

const [first] = findComplement(2020, input);
console.log("Part One:", first * (2020 - first));

/**
 * Part Two
 */

for (const first of input) {
  const target = 2020 - first;
  const complements = findComplement(target, input);

  if (complements.length === 0) continue;

  const [second] = complements;

  console.log("Part Two:", first * second * (target - second));
  break;
}
