const isDebug = Deno.args.includes("--debug");
const log = console.log;

const transpose = <T>(matrix: T[][]) =>
  matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse());

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = (input: string, ans: Answer) => {
  /**
   * Part One
   */

  const schematics = input
    .split("\n\n")
    .map((row) => row.split("\n").map((r) => r.split("")));

  const isFilled = (c: string) => c === "#";
  const isEmpty = (c: string) => c === ".";

  const locks = schematics
    .filter((sch) => sch[0].every(isFilled))
    .map(transpose);

  const keys = schematics
    .filter((sch) => sch[0].every(isEmpty)) //
    .map(transpose);

  const lockPins = locks.map((lockCols) =>
    lockCols.map(
      (col) => col.filter(isFilled).length - 1 //
    )
  );

  const keyPins = keys.map((lockCols) =>
    lockCols.map(
      (col) => col.filter(isFilled).length - 1 //
    )
  );

  const height = locks[0].length;

  ans.p1 = lockPins
    .map(
      (lock) =>
        keyPins.filter((key) =>
          lock.every(
            (pin, pos) => pin + key[pos] <= height // no overlaps
          )
        ).length
    )
    .reduce(sum);
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  log("-- Day", filename, "--");

  const path = isExample ? "./input/example.in" : `./input/${filename}.in`;
  const input = await Deno.readTextFile(path);

  const ans: Answer = { p1: 0 };

  if (isExample) log("Example");

  solve(input, ans);

  console.log("Part 1:", ans.p1);

  log("-- Done --");
}

type Answer = { p1: any };

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);
