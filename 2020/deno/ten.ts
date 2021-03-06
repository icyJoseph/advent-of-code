const input = await Deno.readTextFile("./input/ten.in").then((res) =>
  res.split("\n").map(Number)
);

/**
 * Part One
 */

const max = Math.max(...input);
const adapter = max + 3;

const sorted = [0, ...input, adapter].slice(0).sort((a, b) => a - b);

const [, ones, , threes] = sorted.reduce<number[]>((prev, curr, index, src) => {
  const next = src[index + 1];
  // luckily next can't be zero in this problem
  if (!next) return prev;

  const diff = next - curr;

  prev[diff] = (prev[diff] ?? 0) + 1;

  return prev;
}, []);

console.log("Part One:", ones * threes);

/**
 * Part Two Original
 */

const combinations = sorted
  .reduce<number[][]>(
    (prev, curr, index, src) => {
      const last = prev.pop() ?? [];

      prev = [...prev, [...last, curr]];

      const next = src[index + 1];

      if (next - curr === 3) {
        prev = [...prev, []];
      }

      return prev;
    },
    [[]]
  )
  .map((group) => {
    switch (group.length) {
      case 0:
      case 1:
      case 2:
        return 1;
      case 3:
        return 2;
      case 4:
        return 4;
      case 5:
        return 7;
      default:
        throw new Error("Impossible");
    }
  })
  .reduce<number>((prev, curr) => prev * curr, 1);

console.log("Part Two:", combinations);

/**
 * Helpers
 */

const head = ([head]: number[]) => head;
const last = (arr: number[]) => head(arr.slice(-1));
const sum = (a: number, b: number) => a + b;

/**
 * Part Two Improved
 */

const improved = last(
  sorted.reduce<number[]>(
    (prev, num, index, src) => [
      ...prev,
      src
        .filter((n) => num > n && num - n <= 3)
        .map((x) => src.indexOf(x))
        .map((x) => prev[x])
        .reduce(sum, index === 0 ? 1 : 0)
    ],
    []
  )
);

console.log("Part Two Improved:", improved);
