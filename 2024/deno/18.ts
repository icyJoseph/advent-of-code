const isDebug = Deno.args.includes("--debug");
const log = console.log;

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = (input: string, ans: Answer) => {
  /**
   * Part One
   */

  const bytes = input.split("\n").map((row) => row.split(",").map(Number));

  // [x,y]
  const start = [0, 0];
  const end = isExample ? [6, 6] : [70, 70];

  const width = end[0] + 1;
  const height = end[1] + 1;

  const grid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ".")
  );

  const flat = grid.flat();
  bytes
    .map(([x, y]) => coordToIndex(x, y, width))
    .slice(0, isExample ? 12 : 1024)
    .forEach((entry) => {
      flat[entry] = "#";
    });

  const adj = makeAdj(width, height);

  const steps = bfs({
    start: 0,
    end: coordToIndex(end[0], end[1], width),
    grid: flat,
    adj,
  });

  ans.p1 = steps;

  /**
   * Part Two
   */

  for (const [i, byte] of enumerate(bytes)) {
    const flat = grid.flat();

    bytes
      .map(([x, y]) => coordToIndex(x, y, width))
      .slice(0, i + 1)
      .forEach((entry) => {
        flat[entry] = "#";
      });

    const steps = bfs({
      start: 0,
      end: coordToIndex(end[0], end[1], width),
      grid: flat,
      adj,
    });

    if (Number.isInteger(steps)) {
      continue;
    }

    ans.p2 = byte.join(",");
    break;
  }
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  log("-- Day", filename, "--");

  const path = isExample ? "./input/example.in" : `./input/${filename}.in`;
  const input = await Deno.readTextFile(path);

  const ans: Answer = { p1: 0, p2: 0 };

  if (isExample) log("Example");

  solve(input, ans);

  console.log("Part 1:", ans.p1);
  console.log("Part 2:", ans.p2);

  log("-- Done --");
}

type Answer = { p1: unknown; p2: unknown };

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);

function coordToIndex(x: number, y: number, width: number) {
  return x + y * width;
}

function makeAdj(width: number, height: number) {
  const adj: number[][] = Array.from({ length: height * width }, () => []);

  // dx,dy
  const deltas = [
    [-1, 0], //left
    [1, 0], //right
    [0, -1], //up
    [0, 1], //down
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = coordToIndex(x, y, width);

      deltas.forEach(([dx, dy]) => {
        const x1 = x + dx;
        const y1 = y + dy;

        if (0 <= x1 && x1 < width && 0 <= y1 && y1 < height) {
          adj[index].push(coordToIndex(x1, y1, width));
        }
      });
    }
  }

  return adj;
}

function bfs({
  start,
  end,
  grid,
  adj,
}: {
  start: number;
  end: number;
  grid: string[];
  adj: number[][];
}) {
  const q: number[] = [];

  const visited = new Set();
  const distance = Array.from({ length: grid.length }, () => Infinity);

  q.push(start);
  distance[start] = 0;
  visited.add(start);

  while (true) {
    const current = q.shift();

    if (current == null) break;

    for (const vec of adj[current]) {
      if (grid[vec] === "#") continue;

      if (distance[current] + 1 < distance[vec]) {
        distance[vec] = distance[current] + 1;

        q.push(vec);
      }
    }
  }

  return distance[end];
}

function enumerate<T>(arr: T[]): Array<[number, T]> {
  return arr.map((n, index) => [index, n]);
}
