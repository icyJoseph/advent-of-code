/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const isNumber = (n: number) => !isNaN(n);

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

  const wordRef =
    "one, two, three, four, five, six, seven, eight, nine".split(
      ", ",
    );

  const words = wordRef.map((w, d) => [d + 1, w] as const);

  const second = input
    .split("\n")
    .map((chunk) => {
      let first = 0;
      let last = 0;

      for (let index = 0; index < chunk.length; index++) {
        const ch = chunk[index];
        const digit = Number(ch);

        if (isNumber(digit)) {
          first = first || digit;
          last = digit;

          continue;
        }

        words.find(([digit, word]) => {
          if (
            chunk.slice(index, index + word.length) === word
          ) {
            first = first || digit;
            last = digit;
            return;
          }
        });
      }

      return 10 * first + last;
    })
    .reduce(sum);

  console.log("Part two:", second);
}

await solve("./input/01.in");
