type Coord = [x: number, y: number];

type Sensor = {
  center: Coord;
  beacon: Coord;
  radius: number;
};

/**
 * Helpers
 */

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

const outOfSensorRange = ([x, y]: Coord, grid: Sensor[]) =>
  grid.every(({ center, radius }) => {
    const [cx, cy] = center;

    const distance = Math.abs(cx - x) + Math.abs(cy - y);

    return distance >= radius;
  });

const solve = async (example = false) => {
  /**
   * Part One
   */
  const input = await Deno.readTextFile(
    `./input/${example ? "example" : "15"}.in`
  );

  const data = input.split("\n");

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

  const offset = example ? 10 : 2_000_000;
  const occupied = beaconsAtOffset(offset, sensors);
  const forbidden = coverage(offset, sensors)
    .map(([x0, x1]) => x1 - x0 + 1)
    .reduce((a, b) => a + b);

  console.log("Part one:", forbidden - occupied);

  /**
   * Part Two
   */

  //   const maxRange = example ? 20 : 4_000_000;

  const tuningFreq = ([x, y]: Coord) => x * 4_000_000 + y;

  // naive approach, takes about 2 seconds
  //   for (let y = 0; y < maxRange; y++) {
  //     const zones = coverage(y, sensors);

  //     if (zones.length === 2) {
  //       const [[, x0], [x1]] = zones;
  //       const x = Math.floor((x0 + x1) / 2); // or just x0 + 1

  //       console.log("Part two:", tuningFreq([x, y]));

  //       break;
  //     }
  //   }

  /**
   * Part two super fast!! Blazing fast!!!
   */

  // 45 degrees clockwise
  const forwards = ([x, y]: Coord): Coord => [x + y, y - x];
  // 45 degrees anti-clockwise - undoing the above
  const backwards = ([x, y]: Coord): Coord =>
    [(x - y) / 2, (x + y) / 2].map((x) => Math.floor(x)) as Coord;

  type Range = { from: number; to: number };
  type Projection = {
    x: Range;
    y: Range;
  };

  /**
   *
   * Rotating a Manhattan circle resolves
   * to a square. With a square it is easier to measure
   * gaps relative to other squares.
   *
   * The solution beacon has to live in between
   * squares separated by at least 2 units
   *
   *  x    x+2
   *  | - |
   *    x+1 -> beacon.x
   *
   * Same applies for Y axis.
   *
   * Once X and Y in the rotated system are found,
   * rotate back and eliminate those which
   * are part of a sensor's coverage.
   *
   * There'll be only one left.
   *
   */

  // rotates 45 degrees to turn the sensor areas from
  // manhattan circles into squares
  // returns the coordinates of the corners
  const squaredSensors = sensors.map(({ center, radius }) => {
    const [cx, cy] = center;
    const corners: [Coord, Coord, Coord, Coord] = [
      [cx - radius, cy],
      [cx, cy + radius],
      [cx + radius, cy],
      [cx, cy - radius],
    ];

    return corners.map(forwards);
  });

  // represent squares as their projections
  // into the x-axis: x0->x1 and y-axis: y0->y1
  const projections = squaredSensors.map<Projection>((corners) => {
    const [c0, c1, , c3] = corners;

    return {
      x: { from: c0[0], to: c1[0] },
      y: { from: c3[1], to: c0[1] },
    };
  });

  const xProjections = projections.map(({ x }) => x);
  const yProjections = projections.map(({ y }) => y);

  const hasValidGap = (
    pair: Readonly<[Range, Range | undefined]>
  ): pair is [Range, Range] => Boolean(pair[1]);

  const findGap = (self: Range, others: Range[]) =>
    others.find((other) => other !== self && other.from === self.to + 2);

  const xGaps: number[] = xProjections
    .map((self) => [self, findGap(self, xProjections)] as const)
    .filter(hasValidGap)
    .map(([self]) => self.to + 1);

  const yGaps = yProjections
    .map((self) => [self, findGap(self, yProjections)] as const)
    .filter(hasValidGap)
    .map(([self]) => self.to + 1);

  const [beacon, ...rest] = xGaps
    .flatMap((rx) => yGaps.map<Coord>((ry) => [rx, ry]))
    // undo the clockwise rotation
    .map(backwards)
    .filter((coord) => outOfSensorRange(coord, sensors));

  console.assert(rest.length === 0, "Found many beacons!");

  console.log("Part two:", tuningFreq(beacon));
};

solve();
