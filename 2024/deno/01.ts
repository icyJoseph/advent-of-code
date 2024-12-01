const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");

const isExample = Deno.args.includes("--example");
const debug = Deno.args.includes("--debug");
/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (debug) {
    console.log("Debug Mode Active");
  }

  /**
   * Part One
   */

  const joined = input.split("\n").map((line) => {
    const [left, right] = line.split("   ").map(Number);

    return { left, right };
  });

  const left = joined.map(({ left }) => left).toSorted((a, b) => a - b);
  const right = joined.map(({ right }) => right).toSorted((a, b) => a - b);

  const diff = left
    .map((value, index) => Math.abs(value - right[index]))
    .reduce(sum);

  const freq = right.reduce<Map<number, number>>((acc, value) => {
    acc.set(value, (acc.get(value) ?? 0) + 1);

    return acc;
  }, new Map());

  console.log("Part 1:", diff);

  /**
   * Part Two
   */

  console.log(
    "Part 2:",
    left.map((value) => (freq.get(value) || 0) * value).reduce(sum)
  );
};

/**
 * Runtime
 */

console.log("Day", filename);

if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
