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

const asKey = ([x, y]: number[]) => `${x}.${y}`;

const asLines = (path: number[][]) => {
  const pointSet = windows(path, 2).reduce((prev, line) => {
    const [x0, y0] = line[0];
    const [x1, y1] = line[1];

    const lowerX = Math.min(x0, x1);
    const upperX = Math.max(x0, x1);

    const lowerY = Math.min(y0, y1);
    const upperY = Math.max(y0, y1);

    for (let x = lowerX; x <= upperX; x++) {
      for (let y = lowerY; y <= upperY; y++) {
        prev.add(asKey([x, y]));
      }
    }

    return prev;
  }, new Set());

  return pointSet;
};

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

let minX = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;

const paths = data.map((row) => {
  const segments = row
    .split(" -> ")
    // [x,y]
    .map((segment) => {
      const [x, y] = segment.split(",").map(Number);

      if (x < minX) {
        minX = x;
      }

      if (x > maxX) {
        maxX = x;
      }

      if (y > maxY) {
        maxY = y;
      }

      return [x, y];
    });

  return segments;
});

const allPathPoints = paths.reduce((acc, path) => {
  asLines(path).forEach((line) => {
    acc.add(line);
  });
  return acc;
}, new Set());

// TODO: paths to a grid to do O(1) look ups

type SimulateParameters =
  | { hasFloor: false; floorOffset?: never }
  | { hasFloor: true; floorOffset: number };

const simulate = ({ floorOffset, hasFloor }: SimulateParameters) => {
  const offset = hasFloor ? floorOffset : 0;

  const floor = offset + maxY;

  const start = [500, 0];

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

      const isPath = inBounds && allPathPoints.has(key);
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
