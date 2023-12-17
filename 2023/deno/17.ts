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
  compare: (a: T, b: T) => number,
  j: number
): void {
  let i = ((j - 1) / 2) >> 0; // parent node index
  while (j > 0 && compare(items[i], items[j]) < 0) {
    // restore the property
    [items[i], items[j]] = [items[j], items[i]];

    // go up
    (j = i), (i = ((j - 1) / 2) >> 0);
  }
}

function sinkDown<T>(
  items: Array<T>,
  compare: (a: T, b: T) => number,
  i: number,
  n?: number
): void {
  let j, k: number;
  n = n ?? items.length;
  while (true) {
    (j = 2 * i + 1), (k = i);
    if (j < n && compare(items[j], items[k]) > 0) {
      // left child violates the property
      k = j;
    }

    j++;
    if (j < n && compare(items[j], items[k]) > 0) {
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
    private compare: (a: T, b: T) => number
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

const inBound = (n: number, bound: number, lower = 0) =>
  n >= lower && n < bound;

type Entry = {
  score: number;
  current: [number, number];
  steps: number;
  dir: number[];
};

const getScore = (
  entry: Entry,
  grid: { cell: string }[][]
) => {
  const dist =
    Math.abs(grid.length - entry.current[1]) +
    Math.abs(grid[0].length - entry.current[0]);

  return dist + entry.score;
};
const compareScoreFn =
  (grid: { cell: string }[][]) =>
  (lhs: Entry, rhs: Entry) => {
    return -getScore(lhs, grid) + getScore(rhs, grid);
  };

const [D, L, U, R] = [
  [0, 1], // Down
  [-1, 0], // Left
  [0, -1], // Up
  [1, 0], // Right
];

const dirs = [D, L, U, R];

const reverse = new Map();

reverse.set(D, U);
reverse.set(U, D);
reverse.set(L, R);
reverse.set(R, L);

function bfs({
  start,
  end,
  grid,
  width,
  height,
  stepRule,
}: {
  start: [number, number];
  end: [number, number];
  grid: { cell: string }[][];
  width: number;
  height: number;
  stepRule: (prev: number, current: number) => boolean;
}) {
  const compare = compareScoreFn(grid);

  const q = new Heap<Entry>(compare);

  const visited: Record<string, number> = {};

  q.push({
    current: start,
    score: 0,
    steps: 0,
    dir: D,
  });
  q.push({
    current: start,
    score: 0,
    steps: 0,
    dir: R,
  });

  while (true) {
    const node = q.pop();

    if (node == null) break;

    if (
      node.current[0] === end[0] &&
      node.current[1] === end[1] &&
      stepRule(node.steps, node.steps)
    ) {
      return node.score;
    }

    // [x,y]
    const adj = dirs
      .map((dir) => {
        const [dx, dy] = dir;
        const current: [number, number] = [
          node.current[0] + dx,
          node.current[1] + dy,
        ];
        return {
          current,
          steps: dir === node.dir ? node.steps + 1 : 1,
          dir,
        };
      })
      // prevent reverse
      .filter(({ dir }) => reverse.get(dir) !== node.dir)
      // prevent out of bounds
      .filter(
        ({ current: [x, y] }) =>
          inBound(x, width) && inBound(y, height)
      )
      // update scores
      .map(({ current, ...rest }) => {
        return {
          ...rest,
          current,
          score:
            node.score +
            Number(grid[current[1]][current[0]].cell),
        };
      })
      .filter(({ steps }) => {
        return stepRule(node.steps, steps);
      });

    for (const entry of adj) {
      const { current, dir, score, steps } = entry;
      const key = `${current[0]}::${current[1]}::${dir}::${steps}`;

      const currentScore = visited[key] ?? Infinity;

      if (currentScore > score) {
        visited[key] = score;

        q.push(entry);
        continue;
      }
    }
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
      row.split("").map((cell, x) => ({ cell, x, y }))
    );

  const width = grid[0].length;
  const height = grid.length;

  const best = bfs({
    start: [0, 0],
    grid,
    end: [width - 1, height - 1],
    width,
    height,
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
      width,
      height,
      stepRule: (prev, steps) =>
        (steps > prev || prev >= 4) && steps < 11,
    })
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
