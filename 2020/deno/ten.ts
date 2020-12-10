const input = await Deno.readTextFile("./input/ten.in").then((res) =>
  res.split("\n").map(Number)
);

/**
 * Part One
 */

const max = Math.max(...input);
const adapter = max + 3;

const sorted = [0, ...input, adapter].slice(0).sort((a, b) => a - b);

const differences = sorted.reduce<number[]>((prev, curr, index, src) => {
  const next = src[index + 1];
  // luckily next can't be zero in this problem
  if (!next) return prev;

  const diff = next - curr;

  return { ...prev, [diff]: (prev[diff] ?? 0) + 1 };
}, []);

console.log("Part One:", differences[3] * differences[1]);

/**
 * Part Two
 */

const combinations = sorted
  .map((left, index, src) => ({
    keep: src[index + 1] - left === 3,
    link: [left, src[index + 1]]
  }))
  .filter(({ keep }) => keep)
  .map(({ link }) => link)
  .map(([left], index, src) => {
    const [, prevRight] = src[index - 1] ?? [, 0];

    return sorted.filter((x) => x < left && x > prevRight);
  })
  .map((group) => {
    if (group.length === 0) {
      return 1;
    }
    if (group.length < 3) {
      return group.length * 2;
    }
    return 7;
  })
  .reduce((prev, curr) => prev * curr, 1);

console.log("Part Two:", combinations);
