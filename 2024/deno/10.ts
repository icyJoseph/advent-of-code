const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (isDebug) {
    console.log("Debug Mode Active");
  }

  /**
   * Part One
   */

  const lines = input.split("\n").map((row) => row.split("").map(Number));

  const width = lines[0].length;
  const height = lines.length;

  const adj = makeAdj(width, height);

  const hits = new Map();
  let totalRating = 0;

  lines.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== 0) return;

      const [nines, rating] = search({
        start: coordToIndex(x, y, width),
        adj,
        grid: lines.flat(),
      });

      nines.forEach((pos) => {
        hits.set(pos, (hits.get(pos) ?? 0) + 1);
      });

      totalRating += rating;
    });
  });

  console.log("Part 1:", [...hits.values()].reduce(sum));

  /**
   * Part Two
   */
  console.log("Part 2:", totalRating);
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  console.log("Day", filename);

  if (isExample) {
    console.log("Example");
    await solve(`./input/example.in`);
    console.log("---");
  } else {
    await solve(`./input/${filename}.in`);
  }
}

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);

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

function search<T extends number>({
  start,
  adj,
  grid,
}: {
  start: number;
  adj: number[][];
  grid: T[];
}) {
  const q: number[] = [];
  const nines = new Set<number>();
  let hits = 0;
  q.push(start);

  while (true) {
    const current = q.pop();

    if (current == null) break;

    for (const vec of adj[current]) {
      if (grid[vec] !== grid[current] + 1) continue;
      // good path
      if (grid[vec] === 9) {
        // good path ends
        nines.add(vec);
        hits += 1;
      }

      q.push(vec);
    }
  }

  return [nines, hits] as const;
}

function coordToIndex(x: number, y: number, width: number) {
  return x + y * width;
}
