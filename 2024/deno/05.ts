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

  const [rulesSpec, numbersSpec] = input.split("\n\n");
  const rules = rulesSpec.split("\n").map((row) => row.split("|").map(Number));

  const numbers = numbersSpec
    .split("\n")
    .map((row) => row.split(",").map(Number));

  const valid = numbers.map((row) => {
    const localRules = rules.filter(
      ([left, right]) => row.includes(left) && row.includes(right)
    );

    if (localRules.length === 0) return { valid: true, row };

    return {
      valid: localRules.every(([left, right]) => {
        const leftPos = row.indexOf(left);
        const rightPos = row.indexOf(right);

        return leftPos < rightPos;
      }),
      row,
    };
  });

  const p1 = valid
    .filter(({ valid }) => valid)
    .map(({ row }) => row)
    .map((row, index, src) => row[Math.floor(src[index].length / 2)])
    .reduce(sum);

  console.log("Part 1:", p1);

  /**
   * Part Two
   */

  const p2 = valid
    .filter(({ valid }) => !valid)
    .map(({ row }) => row)
    .map(
      /* repair */ (row) => {
        const localRules = rules.filter(
          ([left, right]) => row.includes(left) && row.includes(right)
        );

        while (true) {
          const nextError = localRules.find(([left, right]) => {
            const leftPos = row.indexOf(left);
            const rightPos = row.indexOf(right);

            return rightPos < leftPos;
          });

          if (!nextError) {
            return row;
          }

          const [left, right] = nextError;

          const leftPos = row.indexOf(left);
          const rightPos = row.indexOf(right);

          row[rightPos] = left;
          row[leftPos] = right;
        }
      }
    )
    .map((row, index, src) => row[Math.floor(src[index].length / 2)])
    .reduce(sum);

  console.log("Part 2:", p2);
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
