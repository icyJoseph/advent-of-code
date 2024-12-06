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

  let startX: number = -1,
    startY: number = -1;

  const lines = input.split("\n").map((row, y) => {
    const cells = row.split("");

    if (startX === -1) {
      startX = cells.findIndex((cell) => cell === "^");
      startY = y;
    }

    return cells;
  });

  console.log("Part 1:", patrol(startX, startY, lines)[1]);

  /**
   * Part Two
   */

  let p2 = 0;

  lines.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === ".") {
        lines[y][x] = "#";

        const [loops] = patrol(startX, startY, lines);

        if (loops) p2 += 1;

        lines[y][x] = cell;
      }
    });
  });

  console.log("Part 2:", p2);
};

const createGuard = (startX: number, startY: number, initialDir: string) => {
  let x = startX;
  let y = startY;
  let dir = initialDir;

  return {
    position(width = 0) {
      return y * width + x;
    },
    hash(width = 0) {
      return this.position(width) * 100 + dir.charCodeAt(0);
    },
    peek<T>(grid: T[][]) {
      switch (dir) {
        case "^":
          return grid[y - 1]?.[x];
        case ">":
          return grid[y]?.[x + 1];
        case "<":
          return grid[y]?.[x - 1];
        case "v":
          return grid[y + 1]?.[x];
      }
    },
    step() {
      switch (dir) {
        case "^":
          y = y - 1;
          break;
        case ">":
          x = x + 1;
          break;
        case "<":
          x = x - 1;
          break;
        case "v":
          y = y + 1;
          break;
      }
    },
    rotate() {
      switch (dir) {
        case "^":
          dir = ">";
          break;
        case ">":
          dir = "v";
          break;
        case "<":
          dir = "^";
          break;
        case "v":
          dir = "<";
          break;
      }
    },
  };
};

function patrol(startX: number, startY: number, grid: string[][]) {
  const guard = createGuard(startX, startY, grid[startY][startX]);
  const width = grid[0].length;

  const visited = new Set();
  const loopDetector = new Set();

  visited.add(guard.position(width));
  loopDetector.add(guard.hash(width));

  while (true) {
    const next = guard.peek(grid);

    // goes off board
    if (next == null) return [false, visited.size] as const;

    if (next === "#") {
      guard.rotate();
    } else {
      guard.step();
    }

    if (loopDetector.has(guard.hash(width))) {
      return [true, visited.size] as const; // loops
    }

    loopDetector.add(guard.hash(width));
    visited.add(guard.position(width));
  }
}

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
