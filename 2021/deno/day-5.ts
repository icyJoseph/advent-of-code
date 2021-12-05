const input = await Deno.readTextFile("./input/day-5.in");

const expand = (
  { x1, y1, x2, y2 }: typeof coords[number],
  skipDiagonals = true
) => {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);

  if (x1 === x2) {
    // horizontal
    const length = maxY - minY;

    return [...Array.from({ length }, (_, i) => [x1, minY + i]), [x1, maxY]];
  }

  if (y1 === y2) {
    // vertical
    const length = maxX - minX;

    return [...Array.from({ length }, (_, i) => [minX + i, y1]), [maxX, y1]];
  }

  if (skipDiagonals) return [];

  const lengthY = maxY - minY;
  const lengthX = maxX - minX;

  console.assert(lengthX === lengthY, "45 deg");

  if (lengthY !== lengthX) return [];

  const sign = Math.sign(minX === x1 ? y2 - y1 : y1 - y2);

  const startY = minX === x1 ? y1 : y2;
  const endY = maxX === x1 ? y1 : y2;

  return [
    ...Array.from({ length: lengthX }, (_, i) => {
      return [minX + i, startY + i * sign];
    }),
    [maxX, endY]
  ];
};

const normal = (x: number, y: number, width: number) => x + y * width;
const revNormal = (norm: number, width: number) => [
  norm % width,
  Math.floor(norm / width)
];

const coords = input.split("\n").map((row) => {
  const [left, right] = row.split(" -> ");
  const [x1, y1] = left.split(",").map(Number);
  const [x2, y2] = right.split(",").map(Number);

  return { x1, y1, x2, y2 };
});

const width = 1 + Math.max(...coords.map(({ x1, x2 }) => [x1, x2]).flat(1));

const countOverlaps = ({ skipDiagonals } = { skipDiagonals: true }) => {
  const table = new Map<number, number>();

  for (const coord of coords) {
    const points = expand(coord, skipDiagonals);

    for (const [x, y] of points) {
      const norm = normal(x, y, width);
      const count = table.get(norm) || 0;
      table.set(norm, count + 1);
    }
  }

  return [...table.values()].filter((count) => count > 1).length;
};

/**
 * Part One
 */

console.log("Part One:", countOverlaps());

/**
 * Part Two
 */

console.log("Part Two:", countOverlaps({ skipDiagonals: false }));
