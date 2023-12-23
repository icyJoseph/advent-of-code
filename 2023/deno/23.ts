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
    .filter(([x, y]) => Math.abs(x) + Math.abs(y) === 1);
  // .filter(([x, y]) => Math.abs(x) + Math.abs(y) !== 0);

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

function dfsWithSlopes({
  start,
  end,
  adj,
  grid,
  size,
}: {
  start: number;
  end: number;
  adj: number[][];
  grid: Array<{ cell: string }>;
  size: number;
}) {
  const q: {
    distance: number;
    index: number;
    rollback?: boolean;
  }[] = [];
  const visited = matrix(size, () => false);

  q.push({ index: start, distance: 0 });

  let max = 0;

  const filterAdj = (curr: string, adj: number[]) => {
    switch (curr) {
      case "v":
        return [adj[0]];
      case "^":
        return [adj[1]];
      case ">":
        return [adj[2]];
      case "<":
        return [adj[3]];
      default:
        return adj;
    }
  };

  while (true) {
    const current = q.pop();

    if (current == null) break;

    if (current.rollback) {
      visited[current.index] = false;
      continue;
    }

    const around = filterAdj(
      grid[current.index].cell,
      adj[current.index]
    );

    for (const vec of around) {
      if (grid[vec].cell === "#") continue;

      const distance = current.distance + 1;
      if (vec === end) {
        max = Math.max(max, distance);
        continue;
      }

      if (visited[vec]) continue;

      visited[vec] = true;

      q.push({ index: vec, distance, rollback: true });

      q.push({
        index: vec,
        distance,
      });
    }
  }

  return max;
}

function dfs({
  start,
  end,
  adj,
  size,
}: {
  start: number;
  end: number;
  adj: Record<
    string,
    { coord: number; distance: number }[]
  >;
  size: number;
}) {
  const q: {
    distance: number;
    index: number;
    rollback?: boolean;
  }[] = [];
  const visited = matrix(size, () => false);

  q.push({ index: start, distance: 0 });

  let max = 0;

  while (true) {
    const current = q.pop();

    if (current == null) break;
    if (current.rollback) {
      visited[current.index] = false;
      continue;
    }

    if (current.index === end) {
      max = Math.max(max, current.distance);
      continue;
    }

    if (visited[current.index]) continue;

    q.push({
      ...current,
      rollback: true,
    });

    visited[current.index] = true;

    const around = adj[current.index];

    for (const vec of around) {
      q.push({
        index: vec.coord,
        distance: current.distance + vec.distance,
      });
    }
  }

  return max;
}

const solve = async (path: string) => {
  if (debug) {
    console.log("Debug Mode Active");
  }

  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */
  const data = input.split("\n").map((row, y) => {
    return row.split("").map((cell, x) => ({ cell, x, y }));
  });

  const width = data[0].length;
  const height = data.length;
  const adj = calcAdj(width, height);

  const grid = data.flat();
  const start = coordToIndex(1, 0, width);
  const end = coordToIndex(width - 2, height - 1, width);

  const longestWithSlopes = dfsWithSlopes({
    start,
    end,
    adj,
    grid,
    size: width * height,
  });

  // 1382 wrong too low
  // 1838 wrong
  // 2190
  console.log("Part 1:", longestWithSlopes);

  const compactAdj = adj
    .map((around, index) => {
      const paths = around.filter(
        (p) => grid[p].cell !== "#"
      );

      return [index, paths] as const;
    })
    .filter(
      ([index, p]) =>
        p.length > 0 && grid[index].cell !== "#"
    )
    .reduce<
      Record<string, { coord: number; distance: number }[]>
    >(
      (acc, curr) => ({
        ...acc,
        [curr[0]]: curr[1].map((coord) => ({
          coord,
          distance: 1,
        })),
      }),
      {}
    );

  Object.entries(compactAdj).forEach(([key, value]) => {
    if (value.length === 2) {
      const [from, to] = value;

      const prev = compactAdj[from.coord].find(
        (entry) => entry.coord === Number(key)
      );

      if (!prev) throw new Error("No prev - TS stuff");
      prev.coord = to.coord;
      prev.distance = from.distance + to.distance;

      const next = compactAdj[to.coord].find(
        (entry) => entry.coord === Number(key)
      );

      if (!next) throw new Error("No next - TS stuff");
      next.coord = from.coord;
      next.distance = from.distance + to.distance;

      delete compactAdj[key];
    }
  });

  /**
   * Part Two
   */
  const longest = dfs({
    start,
    end,
    adj: compactAdj,
    size: width * height,
  });

  // 3294 wrong
  // 5526 wrong
  // 6006 wrong
  // 6258
  console.log("Part 2:", longest);
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
