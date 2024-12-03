const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;
const prod = (a: number, b: number) => a * b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (isDebug) {
    console.log("Debug Mode Active");
  }

  /**
   * Part One
   */

  const getFactors = (spec: string) =>
    spec.replace("mul(", "").replace(")", "").split(",");

  const parseFactors = (spec: string) => getFactors(spec).map(Number);

  const doMul = (spec: string) => parseFactors(spec).reduce(prod);

  console.log(
    "Part 1:",
    input
      .match(/mul\([\d]+,[\d]+\)/g)
      ?.map(doMul)
      .reduce(sum)
  );

  const DO_NOT = "don't()";
  const DO = "do()";

  function createState() {
    let enabled = true;
    const prods: string[] = [];

    return {
      [Symbol.iterator]() {
        let index = 0;
        return {
          next() {
            return {
              done: index === prods.length,
              value: prods[index++],
            };
          },
        };
      },
      readInst(inst: string) {
        switch (inst) {
          case DO_NOT:
            enabled = false;
            break;

          case DO:
            enabled = true;
            break;

          default:
            enabled && prods.push(inst);
            break;
        }
      },
    };
  }

  /**
   * Part Two
   */
  const state = createState();

  input.match(/mul\([\d]+,[\d]+\)|don\'t\(\)|do\(\)/g)?.forEach(state.readInst);

  console.log("Part 2:", [...state].map(doMul).reduce(sum));
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
