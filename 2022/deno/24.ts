const [__filename_ext] = new URL("", import.meta.url).pathname
  .split("/")
  .slice(-1);
const filename = __filename_ext.replace(".ts", "");

type Coord = { x: number; y: number };

const asKey = ({ x, y }: Coord) => `${x}.${y}`;
const asState = (coord: Coord, z: number) => `${asKey(coord)}.${z}`;

function calcAdj(width: number, height: number) {
  const adj: Record<string, { x: number; y: number }[]> = {};

  const dirs = [0, 1, -1];

  // generate unit vector permutations for 2d
  const deltas = dirs
    .flatMap((x) => dirs.map((y) => [x, y]))
    // includes staying in the same place
    .filter(([x, y]) => Math.abs(x) + Math.abs(y) !== 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = asKey({ x, y });

      if (x === 1 && y === 0) {
        adj[key] = adj[key] || [];
        adj[key].push({ x: 1, y: 1 });
        adj[key].push({ x, y });
        continue;
      }

      if (x === width - 2 && y === height - 1) {
        adj[key] = adj[key] || [];
        adj[key].push({ x: width - 2, y: height - 2 });
        adj[key].push({ x, y });
        continue;
      }

      if (x === 0) continue;
      if (y === 0) continue;
      if (x === width - 1) continue;
      if (y === height - 1) continue;

      deltas.forEach(([dx, dy]) => {
        const x1 = x + dx;
        const y1 = y + dy;

        if ((x1 === 1 && y1 === 0) || (x1 === width - 2 && y1 === height - 1)) {
          adj[key] = adj[key] || [];
          adj[key].push({ x: x1, y: y1 });
          return;
        }
        // reaches a wall
        if (x1 === 0 || x1 === width - 1) {
          return;
        }

        if (y1 === 0 || y1 === height - 1) {
          return;
        }

        adj[key] = adj[key] || [];
        adj[key].push({ x: x1, y: y1 });
      });
    }
  }

  return adj;
}

type Adj = ReturnType<typeof calcAdj>;
type Blizzard = Record<string, Coord & { cell: string }>;

const moveBlizzard = (graph: Blizzard, width: number, height: number) => {
  const update: Blizzard = {};

  for (const [_, node] of Object.entries(graph)) {
    let x1 = node.x;
    let y1 = node.y;
    switch (node.cell) {
      case "<":
        x1 = x1 - 1;
        break;
      case ">":
        x1 = x1 + 1;
        break;
      case "v":
        y1 = y1 + 1;
        break;
      case "^":
        y1 = y1 - 1;
        break;
      default:
        throw new Error("bad cell: " + node.cell);
    }

    if (x1 === width - 1) {
      x1 = 1;
    }

    if (x1 === 0) {
      x1 = width - 2;
    }

    if (y1 === height - 1) {
      y1 = 1;
    }

    if (y1 === 0) {
      y1 = height - 2;
    }

    update[`${asKey({ x: x1, y: y1 })}.${node.cell}`] = {
      x: x1,
      y: y1,
      cell: node.cell,
    };
  }

  return update;
};

const bfs = (
  root: Coord,
  end: Coord,
  minute: number,
  frames: Set<string>[],
  adj: Adj
) => {
  const q: string[] = [];

  const totalFrames = frames.length;

  q.push(asState(root, minute));

  const seen = new Set();

  while (true) {
    const state = q.shift();

    if (!state) break;

    const [x, y, tick] = state.split(".").map(Number);

    const normalKey = asState({ x, y }, tick % totalFrames);

    if (seen.has(normalKey)) {
      continue;
    }

    seen.add(normalKey);

    if (x === end.x && y === end.y) {
      return tick;
    }

    for (const node of adj[asKey({ x, y })]) {
      const key = asKey(node);

      const occupied = frames[(tick + 1) % totalFrames];

      if (!occupied.has(key)) {
        q.push(asState(node, tick + 1));
      }
    }
  }

  return Infinity;
};

const solve = async (pathname: string) => {
  const input = await Deno.readTextFile(pathname);

  const data = input.split("\n");

  const grid = data.map((row) => row.split(""));

  const width = grid[0].length;
  const height = grid.length;

  const start = { x: 1, y: 0 };
  const end = { x: width - 2, y: height - 1 };

  const adj = calcAdj(width, height);

  const frames: Set<string>[] = [];
  const seen = new Set<string>();

  const initial = grid.reduce<Blizzard>((acc, row, y) => {
    row.forEach((cell, x) => {
      if (cell === "#") return;
      if (cell === ".") return;

      acc[`${asKey({ x, y })}.${cell}`] = { x, y, cell };
    });

    return acc;
  }, {});

  let next = initial;

  while (true) {
    const frame = new Set(
      Object.keys(
        next
        // remove the direction of movement from coordinate
      ).map((n) => n.split(".").slice(0, 2).join("."))
    );

    // if we arrive at an already seen frame
    if (seen.has(Array.from(frame).join("::"))) break;

    frames.push(frame);
    seen.add(Array.from(frame).join("::"));

    next = moveBlizzard(next, width, height);
  }

  /**
   * Part One
   */
  const forward = bfs(start, end, 0, frames, adj)!;
  console.log("Part one:", forward);

  /**
   * Part Two
   */
  console.log(
    "Part two:",
    [
      // [start, end],
      [end, start],
      [start, end],
    ].reduce((prev, [from, to]) => bfs(from, to, prev, frames, adj), forward)
  );
};

if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/${filename}.example.in`);
  console.log("---");
}

await solve(`./input/${filename}.in`);
