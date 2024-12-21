const isDebug = Deno.args.includes("--debug");
const log = console.log;

/**
 * Helpers
 */

const solve = (input: string, ans: Answer) => {
  /**
   * Part One
   */

  const codes = input.split("\n").map((row) => row.split(""));

  // const keypad = {
  //   // x,y
  //   7: [0, 0],
  //   8: [1, 0],
  //   9: [2, 0],
  //   4: [0, 1],
  //   5: [1, 1],
  //   6: [2, 1],
  //   1: [0, 2],
  //   2: [1, 2],
  //   3: [2, 2],
  //   0: [1, 3],
  //   A: [2, 3],
  // };

  const keypadAdj = {
    "7": ["4", "8"],
    "8": ["7", "5", "9"],
    "9": ["8", "6"],
    "4": ["7", "5", "1"],
    "5": ["4", "8", "6", "2"],
    "6": ["5", "9", "3"],
    "1": ["4", "2"],
    "2": ["1", "5", "3", "0"],
    "3": ["2", "6", "A"],
    "0": ["2", "A"],
    A: ["0", "3"],
  };

  const controlsAdj = {
    "^": ["A", "v"],
    A: ["^", ">"],
    "<": ["v"],
    v: ["<", "^", ">"],
    ">": ["v", "A"],
  };

  /**
+---+---+---+
| 7 | 8 | 9 |
+---+---+---+
| 4 | 5 | 6 |
+---+---+---+
| 1 | 2 | 3 |
+---+---+---+
    | 0 | A |
    +---+---+
   */
  const keypadDirs = /* from -> to */ {
    "7": { "4": "v", "8": ">" },
    "8": { "7": "<", "9": ">", "5": "v" },
    "9": { "8": "<", "6": "v" },

    "4": { "7": "^", "5": ">", "1": "v" },
    "5": { "4": "<", "6": ">", "8": "^", "2": "v" },
    "6": { "5": "<", "3": "v", "9": "^" },

    "1": { "4": "^", "2": ">" },
    "2": { "1": "<", "5": "^", "3": ">", "0": "v" },
    "3": { "2": "<", "6": "^", A: "v" },

    "0": { "2": "^", A: ">" },
    A: { "0": "<", "3": "^" },
  };

  /**
     +---+---+
    | ^ | A |
+---+---+---+
| < | v | > |
+---+---+---+
   */
  const controlDirs = /* from -> to */ {
    "^": {
      A: ">",
      v: "v",
    },
    A: {
      "^": "<",
      ">": "v",
    },
    "<": {
      v: ">",
    },
    v: {
      "^": "^",
      "<": "<",
      ">": ">",
    },
    ">": {
      A: "^",
      v: "<",
    },
  };

  // const keyPadGrid = [
  //   [7, 8, 9],
  //   [4, 5, 6],
  //   [1, 2, 3],
  //   [null, 0, "A"],
  // ] as const;

  // const controls = {
  //   "^": [1, 0],
  //   A: [2, 0],
  //   "<": [0, 1],
  //   v: [1, 1],
  //   ">": [2, 1],
  // };

  // const dirs = {
  //   "^": [0, -1],
  //   "<": [-1, 0],
  //   v: [0, 1],
  //   ">": [1, 0],
  // };

  function toDirs(path: Entry[], lookUp: Record<Entry, Record<Entry, string>>) {
    return (
      path.reduce((acc, from, index, src) => {
        const to = src[index + 1];

        if (!to) return acc;

        return `${acc}${lookUp[from][to]}`;
      }, "") + "A"
    );
  }

  if (isDebug) {
    console.log(bfs(keypadAdj, "A", "0").map((p) => toDirs(p, keypadDirs)));
  }

  const hashCode = (code: string[]) => {
    return code.reduce((acc, curr) => {
      return acc * 100 + curr.charCodeAt(0);
    }, 0);
  };

  const search = (
    sequence: string[],
    graph: typeof keypadAdj | typeof controlsAdj,
    limit: number,
    depth = 0,
    cache = new Map<number, number>()
  ): number => {
    if (limit < depth) return sequence.length;

    const key = hashCode(sequence) * 100 + depth;

    if (cache.has(key)) return cache.get(key) ?? Infinity;

    const [total] = sequence.reduce<[number, string]>(
      ([acc, from], to) => {
        const moves = bfs(graph, from, to).map((path) =>
          toDirs(path, graph === keypadAdj ? keypadDirs : controlDirs)
        );

        let best = Infinity;

        moves.forEach((move) => {
          best = Math.min(
            search(move.split(""), controlsAdj, limit, depth + 1, cache),
            best
          );
        });

        acc += best;

        return [acc, to];
      },
      [0, "A"] as const
    );

    cache.set(key, total);
    return total;
  };

  codes.forEach((code) => {
    const value = parseInt(code.join(""));
    /**
     * Part One
     */
    ans.p1 += value * search(code, keypadAdj, 2);
    /**
     * Part Two
     */
    ans.p2 += value * search(code, keypadAdj, 25);
  });
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

type Entry = string | number;

function bfs(graph: Record<Entry, Entry[]>, start: Entry, end: Entry) {
  const queue: [Entry, Entry[]][] = [[start, [start]]];

  const distances = new Map<Entry, number>();

  const allPaths = [];

  while (true) {
    const current = queue.shift();

    if (current == null) break;

    const [node, path] = current;

    if (node === end) allPaths.push(path);

    if ((distances.get(node) ?? Infinity) < path.length) continue;

    if (graph[node] == null) continue;

    for (const vec of graph[node]) {
      const next = [...path, vec];

      if ((distances.get(vec) ?? Infinity) >= next.length) {
        queue.push([vec, next]);
        distances.set(vec, next.length);
      }
    }
  }

  return allPaths;
}

if (isDebug) {
  const graph = {
    1: [2, 3, 4],
    2: [5, 6],
    3: [10],
    4: [7, 8],
    5: [9, 10],
    7: [11, 12],
    11: [13],
  };

  console.log(bfs(graph, 1, 13));
}
