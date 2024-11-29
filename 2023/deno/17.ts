const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

// Heap taken from https://dev.to/taumechanica/generic-binary-heap-in-typescript-ilc
// my own had a bug...
function bubbleUp<T>(
  items: Array<T>,
  compare: (a: T, b: T) => boolean,
  j: number,
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
  n?: number,
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

  public constructor(
    private compare: (a: T, b: T) => boolean,
  ) {
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

type Entry = {
  score: number;
  x: number;
  y: number;
  steps: number;
  dir: { dx: number; dy: number; rank: number };
};

const compareEntries = (lhs: Entry, rhs: Entry) => {
  return (rhs.score + rhs.y + rhs.x) >
    (lhs.score + lhs.y + lhs.x);
};

const hashEntry = (x: number, y: number, rank: number, steps: number) => {
  // works only in grids less than 1000 items wide or tall
  return y * 10_000_000 + x * 10_000 + steps * 10 +
    rank;
};

const [D, L, U, R] = [
  [0, 1], // Down
  [-1, 0], // Left
  [0, -1], // Up
  [1, 0], // Right
].map(([dx, dy], rank) => ({ dx, dy, rank }));

const dirs = [D, L, U, R];

function bfs({
  start,
  end,
  grid,
  stepRule,
}: {
  start: [number, number];
  end: [number, number];
  grid: { cell: number }[][];
  stepRule: (prev: number, current: number) => boolean;
}) {
  const q = new Heap<Entry>(compareEntries);

  const visited: Map<number, number> = new Map();

  q.push({
    x: start[0],
    y: start[1],
    score: 0,
    steps: 0,
    dir: D,
  });
  q.push({
    x: start[0],
    y: start[1],
    score: 0,
    steps: 0,
    dir: R,
  });

  while (true) {
    const node = q.pop();

    if (node == null) break;

    if (
      node.x === end[0] &&
      node.y === end[1] &&
      stepRule(node.steps, node.steps)
    ) {
      return node.score;
    }

    dirs
      .forEach((dir) => {
        const x = node.x + dir.dx;
        const y = node.y + dir.dy;

        const cell = grid[y]?.[x]?.cell;

        if (!cell) {
          return;
        }

        if (
          dir.dx + node.dir.dx === 0 &&
          dir.dy + node.dir.dy === 0
        ) {
          return;
        }

        const steps = dir === node.dir ? node.steps + 1 : 1;

        if (!stepRule(node.steps, steps)) {
          return;
        }

        const key = hashEntry(x, y, dir.rank, steps);

        const currentScore = visited.get(key) ?? Infinity;

        const score = node.score + cell;

        if (currentScore <= score) {
          return;
        }

        visited.set(key, score);

        const entry = {
          x,
          y,
          steps,
          dir,
          score,
        };

        q.push(entry);
      });
  }
  return null;
}

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const grid = input
    .split("\n")
    .map((row, y) =>
      row.split("").map((cell, x) => ({
        cell: Number(cell),
        x,
        y,
      }))
    );

  const width = grid[0].length;
  const height = grid.length;

  const best = bfs({
    start: [0, 0],
    grid,
    end: [width - 1, height - 1],
    stepRule: (_, current) => current <= 3,
  });

  // 631 wrong
  // 630 wrong
  // 635
  console.log("Part 1:", best);

  /**
   * Part Two
   */

  // 666 wrong
  // 732 wrong
  // 734
  console.log(
    "Part 2:",
    bfs({
      start: [0, 0],
      grid,
      end: [width - 1, height - 1],
      stepRule: (prev, steps) => (steps > prev || prev >= 4) && steps < 11,
    }),
  );
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/${filename}.example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
