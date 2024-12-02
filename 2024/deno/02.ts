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

  const lines = input.split("\n").map((row) => row.split(" ").map(Number));

  function isValidReport(row: number[]) {
    const deltas = row.slice(1).map((val, index) => val - row[index]);

    const withinLimits = deltas
      .map((diff) => Math.abs(diff))
      .every((diff) => 1 <= diff && diff <= 3);

    const firstSign = Math.sign(deltas[0]);
    const uniform = deltas
      .slice(1)
      .every((delta) => Math.sign(delta) === firstSign);

    return withinLimits && uniform;
  }

  console.log("Part 1:", lines.filter(isValidReport).length);

  /**
   * Part Two
   */
  console.log(
    "Part 2:",
    lines.filter((report) => {
      return (
        isValidReport(report) ||
        report.some((_, index, src) => {
          const modified = src.toSpliced(index, 1);
          return isValidReport(modified);
        })
      );
    }).length
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
