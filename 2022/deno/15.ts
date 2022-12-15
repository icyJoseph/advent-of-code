const input = await Deno.readTextFile("./input/15.in");

const data = input.split("\n");

const merge = (intervals: number[][]) => {
  if (intervals.length < 2) return intervals;

  const result = [];
  let [previous] = intervals;

  for (const interval of intervals) {
    if (previous[1] >= interval[0]) {
      previous = [previous[0], Math.max(previous[1], interval[1])];
    } else {
      result.push(previous);
      previous = interval;
    }
  }

  result.push(previous);

  return result;
};

/**
 * Part One
 */

const sensors = data.map((row) => {
  const [xS, yS, xB, yB] = row
    .replace(":", "")
    .replaceAll(",", "")
    .replaceAll("=", " ")
    .split(" ")
    .map(Number)
    .filter(isFinite);

  const radius = Math.abs(xB - xS) + Math.abs(yB - yS);
  return { center: [xS, yS], beacon: [xB, yB], radius };
});

const intersection = ({
  center,
  radius: r,
  y,
}: {
  center: number[];
  radius: number;
  y: number;
}) => {
  const [cx, cy] = center;

  if (y > cy + r || y < cy - r) return [];

  // r = |x - cx| + |y - cy|
  // |x - cx| = r - |y - cy| = delta
  // x = cx + delta; cx - delta
  const delta = r - Math.abs(y - cy);

  // overlaps [from, to
  return [cx - delta, cx + delta];
};

const coverage = (y: number) =>
  sensors
    .map(({ center, radius }) => intersection({ center, radius, y }))
    .filter((overlap) => Boolean(overlap.length))
    .sort((a, b) => a[0] - b[0])
    .reduce<number[][]>((prev, overlap) => {
      prev.push(overlap);
      return merge(prev);
    }, []);

const beaconsAtOffset = (offset: number) =>
  new Set(
    sensors
      .filter(({ beacon }) => beacon[1] === offset)
      .map(({ beacon }) => `${beacon}`)
  ).size;

const offset = 2_000_000;
const occupied = beaconsAtOffset(offset);
const forbidden = coverage(offset)
  .map(([x0, x1]) => x1 - x0 + 1)
  .reduce((a, b) => a + b);

console.log("Part one:", forbidden - occupied);

/**
 * Part Two
 */

const maxRange = 4_000_000;

const tuningFreq = ([x, y]: number[]) => x * maxRange + y;

for (let y = 0; y < maxRange; y++) {
  const zones = coverage(y);

  if (zones.length === 2) {
    const [[, x0], [x1]] = zones;
    const x = Math.floor((x0 + x1) / 2); // or just x0 + 1

    console.log("Part two:", tuningFreq([x, y]));

    break;
  }
}
