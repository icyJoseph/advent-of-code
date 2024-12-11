const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (isDebug) {
    console.log("Debug Mode Active");
  }

  /**
   * Part One
   */

  function blink(stone: number): number[] {
    if (stone === 0) return [1];

    const digits = `${stone}`;

    if (digits.length % 2 === 0) {
      return [
        Number(digits.slice(0, digits.length / 2)),
        Number(digits.slice(digits.length / 2)),
      ];
    }

    return [stone * 2024];
  }

  let stones = input.split(" ").map(Number);

  let sim = 0;

  while (sim < 25) {
    stones = stones.flatMap(blink);

    sim++;
  }

  console.log("Part 1:", stones.length);

  /**
   * Part Two
   */

  stones = input.split(" ").map(Number);

  type Book = Record<string | number, number>;

  let record = stones.reduce<Book>((acc, curr) => {
    acc[curr] = 1;
    return acc;
  }, {});

  sim = 0;

  while (sim < 75) {
    const local: Book = {};

    Object.entries(record).forEach(([key, value]) => {
      const muts = blink(Number(key));

      muts.forEach((m) => {
        local[m] = (local[m] ?? 0) + 1 * value;
      });
    });

    record = local;

    sim++;
  }

  console.log("Part 2:", Object.values(record).reduce(sum));
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  console.log("Day", filename);

  if (isExample) {
    console.log("Example");
    await solve(`./input/example.in`);
    console.log("---");
  } else {
    await solve(`./input/${filename}.in`);
  }
}

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);
