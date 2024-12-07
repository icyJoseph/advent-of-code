const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const digitCount = (num: number) => Math.floor(1 + Math.log10(num));

const sum = (a: number, b: number) => a + b;
const prod = (a: number, b: number) => a * b;
// a whole 1.5 seconds slower, using this concat
// const concat = (a: number, b: number) => Number(`${a}${b}`);
// faster cuz Math
const concat = (a: number, b: number) => a * Math.pow(10, digitCount(b)) + b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (isDebug) {
    console.log("Debug Mode Active");
  }

  type OPs = Array<typeof sum | typeof prod | typeof concat>;

  function search(
    target: number,
    inputs: number[],
    ops: OPs,
    acc = 0
  ): boolean {
    if (inputs.length === 0) return target === acc;

    return ops.some((op) =>
      search(target, inputs.slice(1), ops, op(acc, inputs[0]))
    );
  }

  const lines = input.split("\n").map((row) => {
    const [result, spec] = row.split(": ");
    const inputs = spec.split(" ").map(Number);

    return { result: Number(result), inputs };
  });

  /**
   * Part One
   */
  console.log(
    "Part 1:",
    lines
      .filter(({ result, inputs }) => search(result, inputs, [sum, prod]))
      .map(({ result }) => result)
      .reduce(sum)
  );

  /**
   * Part Two
   */
  console.log(
    "Part 2:",
    lines
      .filter(({ result, inputs }) =>
        search(result, inputs, [sum, prod, concat])
      )
      .map(({ result }) => result)
      .reduce(sum)
  );
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
