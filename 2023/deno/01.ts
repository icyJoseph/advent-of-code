/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const isNumber = (n: number) => !isNaN(n);

const indexOfAll = (list: string, search: string) => {
  let pos = 0;

  const chunks: Array<[string, number]> = [];

  while (pos < list.length) {
    const index = list.indexOf(search, pos);

    if (index !== -1) {
      chunks.push([search, index]);
    }

    pos = pos + 1;
  }

  return chunks;
};

async function solve(path: string) {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */
  const p1 = input
    .split("\n")
    .map((chunk) => {
      const numbers = chunk.split("").map(Number);

      const f = numbers.find(isNumber) ?? 0;
      const s = numbers.findLast(isNumber) ?? 0;

      return 10 * f + s;
    })
    .reduce(sum);

  console.log("Part one:", p1);

  /**
   * Part Two
   */

  const words =
    "one, two, three, four, five, six, seven, eight, nine".split(
      ", "
    );

  const allVariations = words
    .map((w, d) => [w, `${d + 1}`])
    .flat();

  const numberDict = words.reduce<Record<string, number>>(
    (acc, curr, pos) => {
      return { ...acc, [curr]: pos + 1 };
    },
    {}
  );

  const second = input
    .split("\n")
    .map((chunk) => {
      const numbers = allVariations
        .map((variation) => indexOfAll(chunk, variation))
        .flat()
        .sort((a, b) => a[1] - b[1])
        .map(([w]) => numberDict[w] ?? Number(w));

      const f = numbers[0];
      const s = numbers[numbers.length - 1] ?? f;

      return 10 * f + s;
    })
    .reduce(sum);

  console.log("Part two:", second);
}

await solve("./input/01.in");
