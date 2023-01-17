const filename = "18";

const coordToIndex = (x: number, y: number, z: number) => `${x}.${y}.${z}`;

function calcAdj(lower: number, size: number) {
  const adj: Record<string, string[]> = {};

  const dirs = [0, 1, -1];

  // generate unit vectors in 2d
  const d2 = dirs.map((x) => dirs.map((y) => [x, y]));
  // generate unit vector permutations for 3d
  const deltas = dirs
    .map((z) => d2.map((vec) => vec.map((v) => [...v, z])))
    .flat(2)
    // keep only unit vectors
    .filter(([x, y, z]) => Math.abs(x) + Math.abs(y) + Math.abs(z) === 1);

  for (let z = lower; z < size; z++) {
    for (let y = lower; y < size; y++) {
      for (let x = lower; x < size; x++) {
        const index = coordToIndex(x, y, z);

        deltas.forEach(([dx, dy, dz]) => {
          const x1 = x + dx;
          const y1 = y + dy;
          const z1 = z + dz;

          adj[index] = adj[index] || [];
          adj[index].push(coordToIndex(x1, y1, z1));
        });
      }
    }
  }

  return adj;
}

function bfs({
  start,
  adj,
  grid,
}: {
  start: string;
  adj: Record<string, string[]>;
  grid: Record<string, string>;
}) {
  const q: string[] = [];
  const visited = new Set<string>();
  const reachable = new Set<string>();
  const water = new Set<string>();

  visited.add(start);

  q.push(start);

  while (true) {
    const current = q.shift();

    if (current == null) break;
    if (adj[current] == null) continue;

    for (const vec of adj[current]) {
      if (visited.has(vec)) continue;

      visited.add(vec);

      if (grid[vec]) {
        // cube is taken
        reachable.add(vec);
      } else {
        // cube is water
        q.push(vec);
        water.add(vec);
      }
    }
  }

  return { water, reachable };
}

const solve = async (pathname: string) => {
  const input = await Deno.readTextFile(pathname);

  const cubes = input.split("\n").map((row) => row.split(",").map(Number));

  // we need a cube that wraps the entire thing
  const upper = 2 + Math.max(...cubes.flat(1));

  const adj = calcAdj(-1, upper);

  const asKeys = cubes.map((c) => coordToIndex(c[0], c[1], c[2]));
  const keySet = new Set(asKeys);

  /**
   * Part One
   */

  const exposed = asKeys.reduce((prev, key) => {
    for (const face of adj[key]) {
      if (!keySet.has(face)) {
        prev = prev + 1;
      }
    }

    return prev;
  }, 0);

  console.log("Part one:", exposed);

  /**
   * Part Two
   */

  const grid = asKeys.reduce<Record<string, string>>((prev, key) => {
    prev[key] = key;
    return prev;
  }, {});

  const start = coordToIndex(-1, -1, -1);

  // find how many could we reach if we were water
  const { reachable, water } = bfs({
    start,
    grid,
    adj,
  });

  // then count how many faces are reachable by water
  let reachableFaces = 0;

  reachable.forEach((key) => {
    for (const face of adj[key]) {
      if (water.has(face)) {
        reachableFaces = reachableFaces + 1;
      }
    }
  });

  console.log("Part two:", reachableFaces);
};

const example = Deno.args[0];

if (example === "example") {
  console.log("Example");
  await solve("./input/example.in");
  console.log("---");
}

await solve(`./input/${filename}.in`);
