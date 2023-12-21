const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");
const debug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const coordToIndex = (
  x: number,
  y: number,
  width: number
) => x + y * width;

const matrix = <T>(length: number, init: () => T) =>
  Array.from({ length }, init);

const inBound = (n: number, bound: number, lower = 0) =>
  n >= lower && n < bound;

function calcAdj(width: number, height: number) {
  const adj = matrix<number[]>(width * height, () => []);

  const dirs = [0, 1, -1];

  // generate unit vector permutations for 2d
  const deltas = dirs
    .flatMap((x) => dirs.map((y) => [x, y]))
    .filter(([x, y]) => Math.abs(x) + Math.abs(y) !== 2)
    .filter(([x, y]) => Math.abs(x) + Math.abs(y) !== 0);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = coordToIndex(x, y, width);

      deltas.forEach(([dx, dy]) => {
        const x1 = x + dx;
        const y1 = y + dy;

        if (inBound(x1, width) && inBound(y1, height)) {
          adj[index].push(coordToIndex(x1, y1, width));
        }
      });
    }
  }

  return adj;
}

function bfs<T>(
  {
    start,
    adj,
    grid,
  }: {
    start: number;
    adj: number[][];
    grid: T[];
  },
  rounds: number
) {
  const q: { index: number; step: number }[] = [];
  const distance: Array<Set<number>> = [];

  q.push({ index: start, step: 0 });

  while (true) {
    const current = q.shift();

    if (current == null) break;

    for (const vec of adj[current.index]) {
      if (distance[current.step]?.has(vec)) continue;

      if (grid[vec] === "#") continue;

      distance[current.step] =
        distance[current.step] || new Set();
      distance[current.step].add(vec);

      if (current.step === rounds) continue;

      q.push({ index: vec, step: current.step + 1 });
    }
  }

  return distance;
}

type Coord = { x: number; y: number };
const asKey = (coord: Coord) => `${coord.x}::${coord.y}`;
const wrapped = (z: number, mod: number) => {
  return (mod + (z % mod)) % mod;
};

function wrappedBFS<T>(
  {
    start,
    grid,
    width,
    height,
  }: {
    start: Coord;
    grid: Array<Coord & { value: string }>[];
    width: number;
    height: number;
  },
  rounds: number
) {
  const dirs = [0, 1, -1];
  const deltas = dirs
    .flatMap((x) => dirs.map((y) => [x, y]))
    .filter(([x, y]) => Math.abs(x) + Math.abs(y) !== 2)
    .filter(([x, y]) => Math.abs(x) + Math.abs(y) !== 0);

  const q: {
    point: { x: number; y: number };
    step: number;
  }[] = [];
  const distance: Array<Set<string>> = [];

  q.push({ point: start, step: 0 });

  const levels = new Map<number, number>();

  while (true) {
    const current = q.shift();

    if (current == null) break;

    const { point } = current;

    deltas.forEach(([dx, dy]) => {
      const x1 = point.x + dx;
      const y1 = point.y + dy;

      const value =
        grid[wrapped(y1, height)][wrapped(x1, width)].value;

      if (debug) {
        const newYGrid = Math.abs(Math.floor(y1 / height));

        if (!levels.has(newYGrid)) {
          levels.set(newYGrid, current.step);
        }
      }

      if (value === "#") return;

      if (isExample) {
        distance[current.step] =
          distance[current.step] ||
          distance[current.step - 2] ||
          new Set();
      } else {
        distance[current.step] =
          distance[current.step] ||
          new Set(distance[current.step - 2]) ||
          new Set();
      }

      const key = asKey({ x: x1, y: y1 });

      if (distance[current.step].has(key)) return;

      distance[current.step].add(key);

      if (current.step === rounds - 1) return;

      q.push({
        point: { x: x1, y: y1 },
        step: current.step + 1,
      });
    });
  }

  if (debug) {
    levels.forEach((value, key) =>
      console.log(`${key} @ ${value}`)
    );

    console.log(
      "Progression:",
      Array.from(levels.entries()).reduceRight<number[]>(
        (acc, [, value], index, src) => {
          return [
            value - (src[index - 1]?.[1] ?? 0),
            ...acc,
          ];
        },
        []
      )
    );
  }
  return distance;
}

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const grid = input.split("\n").map((row, y) => {
    return row
      .split("")
      .map((value, x) => ({ value, x, y }));
  });

  const width = grid[0].length;
  const height = grid.length;

  const adj = calcAdj(width, height);

  const flatGrid = grid.flat();

  const start = flatGrid.find((x) => x.value === "S");
  if (!start) throw new Error("No start");

  const steps = isExample ? 6 : 64;
  const chart = bfs(
    {
      start: coordToIndex(start.x, start.y, width),
      adj,
      grid: flatGrid.map(({ value }) => value),
    },
    steps
  );

  console.log("Part 1:", chart[steps - 1].size);

  /**
   * Part Two
   */

  if (isExample) {
    const largeChart = wrappedBFS(
      { start, grid, width, height },
      1000
    );
    console.log("Part 2:", largeChart.at(-2)?.size);
  } else {
    const steps = 26501365;
    console.assert(height === width, "not a square grid");

    const offset = steps % height;

    console.assert(
      offset === start.x,
      "offset does not match S x"
    );
    console.assert(
      offset === start.y,
      "offset does not match S y"
    );

    const largeChart = wrappedBFS(
      { start, grid, width, height },
      offset + 3 * height
    );

    let frames = [
      largeChart[offset - 1].size,
      largeChart[offset + height - 1].size,
      largeChart[offset + 2 * height - 1].size,
    ];

    const framesLeftOver = (steps - offset) / height;
    const currentFrame = frames.length - 1;

    for (let i = currentFrame; i < framesLeftOver; i++) {
      /**
       * [a,b,c] -> [b,c,d]
       *
       * d2 = c - b
       * d1 = b - a
       * d0 = d2 - d1
       *
       * d = c + d3 = c + d2 + d0
       */
      const delta2 = frames[2] - frames[1];
      const delta1 = frames[1] - frames[0];
      const delta0 = delta2 - delta1;

      frames = [
        frames[1],
        frames[2],
        frames[2] + delta0 + delta2,
      ];

      if (i === currentFrame) {
        console.assert(
          largeChart.at(-1)?.size === frames[2],
          "Did not predict successfully"
        );
      }
    }

    // 34764700975312110 too high
    // 34764698351686656 too high
    // 34764703598937664 too high
    // 10315711021622186000 too high
    // 7250780686179857 too high
    // 601131471919541 wrong
    // 601107700683837 wrong
    // 601113643448699 right
    console.log("Part 2:", frames.at(-1));
  }
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
