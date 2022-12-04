const input = await Deno.readTextFile("./input/04.in");

const data = input.split("\n");

/**
 * Part One
 */

const overlaps = (left: number[], right: number[]) => {
  return left[0] <= right[0] && right[1] <= left[1];
};

const groups = data.map((group) => {
  const [left, right] = group.split(",");

  const leftRange = left.split("-").map(Number);
  const rightRange = right.split("-").map(Number);

  return [leftRange, rightRange];
});

console.log(
  "Part one:",
  groups.filter(
    (group) => overlaps(group[0], group[1]) || overlaps(group[1], group[0])
  ).length
);

/**
 * Part Two
 */

const anyOverlap = (left: number[], right: number[]) => {
  return right[0] <= left[1] && right[1] >= left[0];
};

console.log(
  "Part two:",
  groups.filter(
    (group) => anyOverlap(group[0], group[1]) || anyOverlap(group[1], group[0])
  ).length
);
