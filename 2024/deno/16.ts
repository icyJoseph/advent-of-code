const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;
const log = console.log;

const [D, L, U, R] = [
  [0, 1], // Down
  [-1, 0], // Left
  [0, -1], // Up
  [1, 0], // Right
].map(([dx, dy], rank) => ({ dx, dy, rank }));

const dirs = [D, L, U, R];

function bubbleUp<T>(
  items: Array<T>,
  compare: (a: T, b: T) => boolean,
  j: number
): void {
  let i = ((j - 1) / 2) >> 0; // parent node index
  while (j > 0 && !compare(items[i], items[j])) {
    // restore the property
    [items[i], items[j]] = [items[j], items[i]];

    // go up
    (j = i), (i = ((j - 1) / 2) >> 0);
  }
}

function sinkDown<T>(
  items: Array<T>,
  compare: (a: T, b: T) => boolean,
  i: number,
  n?: number
): void {
  let j, k: number;
  n = n ?? items.length;
  while (true) {
    (j = 2 * i + 1), (k = i);
    if (j < n && compare(items[j], items[k])) {
      // left child violates the property
      k = j;
    }

    j++;
    if (j < n && compare(items[j], items[k])) {
      // right child violates the property (even more)
      k = j;
    }

    // no property violations
    if (k === i) break;

    // restore the property
    [items[i], items[k]] = [items[k], items[i]];

    // go down
    i = k;
  }
}

class Heap<T> {
  private items: Array<T>;

  public constructor(private compare: (a: T, b: T) => boolean) {
    this.items = new Array<T>();
  }

  public push(item: T): void {
    const j = this.items.length;
    this.items[j] = item; // put to the end
    bubbleUp(this.items, this.compare, j);
  }

  public pop(): T | undefined {
    const { items } = this;
    if (items.length === 0) {
      // heap is empty
      return undefined;
    }

    // remember root as the result
    const result = items[0];
    if (items.length > 1) {
      // put the last item in place of the root
      items[0] = items[items.length - 1];
    }

    // truncate the array
    items.length--;
    if (items.length < 2) {
      // nothing to balance
      return result;
    }

    sinkDown(items, this.compare, 0);
    return result;
  }
}

const compareEntries = (lhs: Entry, rhs: Entry) => {
  // return rhs.score + rhs.y + rhs.x > lhs.score + lhs.y + lhs.x;
  return rhs.score + rhs.y + rhs.x > lhs.score + lhs.y + lhs.x;
};

const solve = (input: string, ans: Answer) => {
  const grid = input.split("\n").map((row) => row.split(""));
  const width = grid[0].length;

  const flat = grid.flat();
  const start = flat.findIndex((c) => c === "S");
  const end = flat.findIndex((c) => c === "E");

  const { min, tiles } = bfs({
    start: index2Coord(start, width),
    end: index2Coord(end, width),
    grid,
  });

  /**
   * Part One
   */
  ans.p1 = min;
  /**
   * Part Two
   */
  ans.p2 = tiles;
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

type Answer = { p1: number; p2: number };

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);

type Entry = {
  score: number;
  x: number;
  y: number;
  dir: { dx: number; dy: number; rank: number };
  path: number[];
};

function coordToIndex(x: number, y: number, width: number) {
  return x + y * width;
}

function index2Coord(index: number, width: number) {
  return { x: index % width, y: Math.floor(index / width) };
}

function bfs<T>({
  start,
  end,
  grid,
}: {
  start: Pick<Entry, "x" | "y">;
  end: Pick<Entry, "x" | "y">;
  grid: T[][];
}) {
  const q = new Heap(compareEntries);

  const visited: Map<number, number> = new Map();

  const width = grid[0].length;
  // start facing east
  q.push({
    ...start,
    score: 0,
    dir: R,
    path: [coordToIndex(start.x, start.y, width)],
  });

  const tiles = new Set();

  let min = Infinity;

  while (true) {
    const current = q.pop();

    if (current == null) break;

    const key =
      coordToIndex(current.x, current.y, width) * 10 + current.dir.rank;

    const currentScore = visited.get(key) ?? Infinity;

    if (currentScore < current.score) {
      continue;
    }

    visited.set(key, current.score);

    if (current.x === end.x && current.y === end.y) {
      if (current.score < min) {
        min = current.score;
        tiles.clear();
        current.path.forEach((i) => tiles.add(i));
      } else if (current.score === min) {
        current.path.forEach((i) => tiles.add(i));
      }
    }

    dirs.forEach((dir) => {
      if (dir.dx + current.dir.dx === 0 && dir.dy + current.dir.dy === 0) {
        return;
      }
      const x = current.x + dir.dx;
      const y = current.y + dir.dy;

      const cell = grid[y]?.[x];

      if (cell === "#") return;

      const localPoints =
        // 1001... that was a very annoying bug
        current.dir.dx === dir.dx && current.dir.dy === dir.dy ? 1 : 1001;

      const score = current.score + localPoints;

      q.push({
        x,
        y,
        dir,
        score,
        path: [...current.path, coordToIndex(x, y, width)],
      });
    });
  }

  return { min, tiles: tiles.size };
}
