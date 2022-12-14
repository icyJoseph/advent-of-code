const input = await Deno.readTextFile("./input/14.in");

const data = input.split("\n");

const windows = <T>(arr: T[], size: number) =>
  arr
    .reduce<T[][]>((acc, _, index, src) => {
      acc.push(src.slice(index, index + size));

      return acc;
    }, [])
    // no irregular windows at the end
    .filter((w) => w.length === size);

const inPath = (point: number[], path: number[][]) => {
  const [x, y] = point;

  return windows(path, 2).some((line) => {
    const [x0, y0] = line[0];
    const [x1, y1] = line[1];

    const lowerX = Math.min(x0, x1);
    const upperX = Math.max(x0, x1);

    const lowerY = Math.min(y0, y1);
    const upperY = Math.max(y0, y1);

    return x <= upperX && x >= lowerX && y <= upperY && y >= lowerY;
  });
};

const asKey = ([x, y]: number[]) => `${x}.${y}`;

const getAdj = ([x, y]: number[]) => {
  return [
    [x, y + 1],
    [x - 1, y + 1],
    [x + 1, y + 1],
  ];
};

/**
 * Part One
 */

const paths = data.map((row) => {
  const segments = row
    .split(" -> ")
    // [x,y]
    .map((segment) => segment.split(",").map(Number));

  return segments;
});

// TODO: paths to a grid to do O(1) look ups

type SimulateParameters =
  | { hasFloor: false; floorOffset?: never }
  | { hasFloor: true; floorOffset: number };

const simulate = ({ floorOffset, hasFloor }: SimulateParameters) => {
  const offset = hasFloor ? floorOffset : 0;

  const floor =
    offset + Math.max(...paths.map((path) => path.map(([_, y]) => y)).flat(1));

  const minX = Math.min(
    ...paths.map((path) => path.map(([x, _]) => x)).flat(1)
  );
  const maxX = Math.max(
    ...paths.map((path) => path.map(([x, _]) => x)).flat(1)
  );

  const start = [500, 0];
  const pathCache = new Map<string, boolean>();
  const sandMap = new Set<string>();

  let current = start;

  const startKey = asKey(start);

  // stops once the start has sand
  while (!sandMap.has(startKey)) {
    const adj = getAdj(current);

    let next = start;

    if (!hasFloor && current[1] >= floor) {
      // if sand goes over the floor
      return sandMap;
    }

    for (const [x, y] of adj) {
      const key = asKey([x, y]);

      const inBounds = x >= minX && x <= maxX;

      const isPath =
        inBounds &&
        (pathCache.get(key) ?? paths.some((path) => inPath([x, y], path)));

      pathCache.set(key, isPath);

      const isEmpty = !sandMap.has(key);
      const isFloor = hasFloor && y === floor;
      const possible = !isPath && isEmpty && !isFloor;

      if (possible) {
        next = [x, y];
        // take this candidate
        break;
      }
    }

    if (next === start) {
      // passed through all candidates and could not assign a new one
      // going back to start
      sandMap.add(asKey(current));
    }

    current = next;
  }

  return sandMap;
};

console.log("Part one:", simulate({ hasFloor: false }).size);
/**
 * Part Two
 */

console.log("Part two:", simulate({ hasFloor: true, floorOffset: 2 }).size);
