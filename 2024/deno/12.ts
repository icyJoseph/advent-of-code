const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (isDebug) {
    console.log("Debug Mode Active");
  }

  /**
   * Part One
   */

  const grid = input.split("\n").map((row) => [".", ...row.split(""), "."]);
  const width = grid[0].length;

  grid.unshift(Array.from({ length: width }, () => "."));
  grid.push(Array.from({ length: width }, () => "."));

  const height = grid.length;

  const adj = makeAdj(width, height);

  let p1 = 0;
  let p2 = 0;

  const flat = grid.flat();
  const done = new Set();

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === ".") return;

      const entry = coordToIndex(x, y, width);

      if (done.has(entry)) return;

      const { area, perimeter, members, edges } = bfs({
        start: entry,
        adj,
        grid: flat,
        size: width * height,
      });

      members.forEach((point) => done.add(point));
      p1 += area * perimeter;

      /**
       * Part Two
       */
      p2 += area * edges;
    });
  });

  console.log("Part 1:", p1);
  console.log("Part 2:", p2);
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
  const adj: { index: number; dir: number }[][] = Array.from(
    { length: height * width },
    () => []
  );

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

      deltas.forEach(([dx, dy], dir) => {
        const x1 = x + dx;
        const y1 = y + dy;

        if (0 <= x1 && x1 < width && 0 <= y1 && y1 < height) {
          adj[index].push({ index: coordToIndex(x1, y1, width), dir });
        }
      });
    }
  }

  return adj;
}

function bfs<T>({
  start,
  adj,
  grid,
}: {
  start: number;
  adj: { index: number; dir: number }[][];
  grid: T[];
  size: number;
}) {
  const q: number[] = [];
  q.push(start);

  const area = new Set<number>();
  area.add(start);

  let perimeter = 0;
  let edges = 0;

  const seenEdge = new Set();

  while (true) {
    const current = q.shift();

    if (current == null) break;

    // for each first adj of current
    for (const { index, dir } of adj[current]) {
      if (grid[index] !== grid[current]) {
        perimeter += 1;

        seenEdge.add(index * 10 + dir);

        // for each adj -> adj of current
        const hitFromSameDir = adj[index].filter((second) => {
          return seenEdge.has(second.index * 10 + dir);
        });

        switch (hitFromSameDir.length) {
          case 2:
            // two edges merge
            edges -= 1;
            break;
          case 1:
            // an edge grows
            // do nothing
            break;
          case 0:
            // a new edge at index
            edges += 1;
            break;
          default:
            throw new Error("</3");
        }

        continue;
      }

      if (area.has(index)) continue;

      area.add(index);
      q.push(index);
    }
  }

  return {
    area: area.size,
    perimeter,
    members: [...area],
    edges,
  };
}

function coordToIndex(x: number, y: number, width: number) {
  return x + y * width;
}
