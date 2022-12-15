const input = await Deno.readTextFile("./input/15.in");

const data = input.split("\n");

type Coord = [x: number, y: number];

type Sensor = {
  center: Coord;
  beacon: Coord;
  radius: number;
};

const merge = (intervals: Coord[]) => {
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

const intersection = ({
  center,
  radius: r,
  y,
}: {
  center: number[];
  radius: number;
  y: number;
}): [] | Coord => {
  const [cx, cy] = center;

  if (y > cy + r || y < cy - r) return [];

  // r = |x - cx| + |y - cy|
  // |x - cx| = r - |y - cy| = delta
  // x = cx + delta; cx - delta
  const delta = r - Math.abs(y - cy);

  // overlaps [from, to]
  return [cx - delta, cx + delta];
};

const coverage = (y: number, grid: Sensor[]) =>
  merge(
    grid
      .map(({ center, radius }) => intersection({ center, radius, y }))
      .filter((overlap): overlap is Coord => Boolean(overlap.length))
      .sort((a, b) => a[0] - b[0])
  );

const beaconsAtOffset = (offset: number, grid: Sensor[]) =>
  new Set(
    grid
      .filter(({ beacon }) => beacon[1] === offset)
      .map(({ beacon }) => `${beacon}`)
  ).size;

/**
 * Part One
 */

const sensors = data.map<Sensor>((row) => {
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

const offset = 2_000_000;
const occupied = beaconsAtOffset(offset, sensors);
const forbidden = coverage(offset, sensors)
  .map(([x0, x1]) => x1 - x0 + 1)
  .reduce((a, b) => a + b);

console.log("Part one:", forbidden - occupied);

/**
 * Part Two
 */

const maxRange = 4_000_000;

const tuningFreq = ([x, y]: Coord) => x * maxRange + y;

for (let y = 0; y < maxRange; y++) {
  const zones = coverage(y, sensors);

  if (zones.length === 2) {
    const [[, x0], [x1]] = zones;
    const x = Math.floor((x0 + x1) / 2); // or just x0 + 1

    console.log("Part two:", tuningFreq([x, y]));

    break;
  }
}
