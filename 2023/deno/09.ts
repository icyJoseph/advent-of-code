const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;
const at = <T>(list: Array<T>, index: number) => {
  const result = list.at(index);

  if (typeof result === "undefined")
    throw new Error(
      `${index} not found within list: ${list}`
    );

  return result;
};

const deltas = (list: number[]) => {
  return list.reduce<number[]>((acc, curr, index, src) => {
    if (index === 0) return acc;
    return [...acc, curr - src[index - 1]];
  }, []);
};

const extend = (row: number[]) => {
  const history: number[][] = [];

  let current: number[] = row;

  while (current.some((x) => x !== 0)) {
    history.push((current = deltas(current)));
  }

  let nextDelta = 0;
  let prevDelta = 0;

  while (history.length > 1) {
    const current = history.pop();

    if (!current) throw new Error("¯\\_(ツ)_/¯");

    const nextRow = at(history, -1);

    // add at the end
    nextDelta = at(nextRow, -1) + at(current, -1);
    nextRow.push(nextDelta);

    // add at the beginning
    prevDelta = nextRow[0] - current[0];
    nextRow.unshift(prevDelta);
  }

  return [
    row[0] - prevDelta,
    row[row.length - 1] + nextDelta,
  ];
};

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const extended = input
    .split("\n")
    .map((row) => row.split(" ").map(Number))
    .map(extend);

  console.log(
    "Part 1:",
    extended.map(([, second]) => second).reduce(sum)
  );

  /**
   * Part Two
   */

  console.log(
    "Part 2:",
    extended.map(([first]) => first).reduce(sum)
  );
};

console.log("Day", filename);
if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
