const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const debug = console.debug;
console.debug = (...args: unknown[]) => {
  if (isDebug) debug(...args);
};

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (isDebug) {
    console.log("Debug Mode Active");
  }

  /**
   * Part One
   */

  const [gridSpec, stepsSpec] = input.split("\n\n");
  const grid = gridSpec.split("\n").map((row) => row.split(""));

  const steps = stepsSpec.split("");

  let initial = [0, 0];

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === "@") initial = [x, y];
    });
  });

  let robot = [...initial];

  steps.forEach((step) => {
    const [x, y] = robot;

    switch (step) {
      case "^": {
        const next = grid[y - 1]?.[x];

        if (!next) return;

        if (next === ".") {
          /// move
          grid[y][x] = ".";
          robot = [x, y - 1];
          grid[y - 1][x] = "@";
        }
        if (next === "O") {
          // move box and robot
          let delta = 2;
          let hasSpace = true;
          while (grid[y - delta]?.[x] && hasSpace) {
            const nextCell = grid[y - delta]?.[x];

            if (nextCell === "#") hasSpace = false;
            if (nextCell === ".") break;
            delta += 1;
          }

          if (!hasSpace) return;

          for (let i = 2; i <= delta; i++) {
            grid[y - delta][x] = "O";
          }

          grid[y][x] = ".";
          robot = [x, y - 1];
          grid[y - 1][x] = "@";
        }
        break;
      }

      case ">": {
        const next = grid[y]?.[x + 1];

        if (!next) return;

        if (next === ".") {
          /// move
          grid[y][x] = ".";
          robot = [x + 1, y];
          grid[y][x + 1] = "@";
        }
        if (next === "O") {
          // move box and robot
          let delta = 2;
          let hasSpace = true;
          while (grid[y]?.[x + delta] && hasSpace) {
            const nextCell = grid[y]?.[x + delta];

            if (nextCell === "#") hasSpace = false;
            if (nextCell === ".") break;
            delta += 1;
          }

          if (!hasSpace) return;

          for (let i = 2; i <= delta; i++) {
            grid[y][x + delta] = "O";
          }

          grid[y][x] = ".";
          robot = [x + 1, y];
          grid[y][x + 1] = "@";
        }
        break;
      }
      case "v": {
        const next = grid[y + 1]?.[x];

        if (!next) return;

        if (next === ".") {
          /// move
          grid[y][x] = ".";
          robot = [x, y + 1];
          grid[y + 1][x] = "@";
        }
        if (next === "O") {
          // move box and robot
          let delta = 2;
          let hasSpace = true;
          while (grid[y + delta]?.[x] && hasSpace) {
            const nextCell = grid[y + delta]?.[x];

            if (nextCell === "#") hasSpace = false;
            if (nextCell === ".") break;
            delta += 1;
          }

          if (!hasSpace) return;

          for (let i = 2; i <= delta; i++) {
            grid[y + delta][x] = "O";
          }

          grid[y][x] = ".";
          robot = [x, y + 1];
          grid[y + 1][x] = "@";
          // move box and robot
        }
        break;
      }
      case "<": {
        const next = grid[y]?.[x - 1];

        if (!next) return;

        if (next === ".") {
          /// move
          grid[y][x] = ".";
          robot = [x - 1, y];
          grid[y][x - 1] = "@";
        }
        if (next === "O") {
          // move box and robot
          let delta = 2;
          let hasSpace = true;
          while (grid[y]?.[x - delta] && hasSpace) {
            const nextCell = grid[y]?.[x - delta];

            if (nextCell === "#") hasSpace = false;
            if (nextCell === ".") break;
            delta += 1;
          }

          if (!hasSpace) return;

          for (let i = 2; i <= delta; i++) {
            grid[y][x - delta] = "O";
          }

          grid[y][x] = ".";
          robot = [x - 1, y];
          grid[y][x - 1] = "@";
        }
        break;
      }
    }
  });

  let p1 = 0;

  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== "O") return;

      p1 += 100 * y + x;
    });
  });

  console.log("Part 1:", p1);

  /**
   * Part Two
   */

  const extGrid = gridSpec.split("\n").map((row) => {
    return row.split("").flatMap((cell) => {
      if (cell === "#") return ["#", "#"];
      if (cell === "O") return ["[", "]"];
      if (cell === ".") return [".", "."];
      if (cell === "@") return ["@", "."];

      return [cell, cell];
    });
  });

  let extInitial = [0, 0];

  type Point = { x: number; y: number };
  const boxes: Point[] = [];

  extGrid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === "@") extInitial = [x, y];
      if (cell === "[") {
        boxes.push({ x, y });
      }
    });
  });

  let extRobot = [...extInitial];

  function updateBoxes({
    x,
    y,
    dir,
  }: {
    x: number;
    y: number;
    dir: [number, number];
  }) {
    const [x1, y1] = [x + dir[0], y + dir[1]];

    const todo = boxes.filter((box) => {
      return box.x <= x1 && x1 <= box.x + 1 && box.y === y1;
    });

    const updates = [];
    const seen = new Set();

    while (true) {
      const curr = todo.pop();

      if (!curr) break;

      if (seen.has(curr)) continue;

      seen.add(curr);

      const [newX, newY] = [curr.x + dir[0], curr.y + dir[1]];
      if (extGrid[newY][newX] === "#" || extGrid[newY][newX + 1] === "#") {
        updates.length = 0;
        break;
      }

      console.debug(curr);

      updates.push(curr);

      boxes.forEach((box) => {
        if (box.y !== newY) return;

        const fwdOverlap = box.x <= newX + 1 && newX + 1 <= box.x + 1;
        const backOverlap = box.x <= newX && newX <= box.x + 1;

        if (fwdOverlap || backOverlap) {
          console.debug("to q", box, { newX, newY, dir, curr });
          todo.push(box);
        }
      });
    }

    return updates;
  }

  steps.forEach((step) => {
    console.debug(step + "\n" + extGrid.map((row) => row.join("")).join("\n"));
    const [x, y] = extRobot;

    let dir: [number, number] = [0, 0];

    switch (step) {
      case "^": {
        dir = [0, -1];
        break;
      }

      case ">": {
        dir = [1, 0];
        break;
      }
      case "v": {
        dir = [0, 1];
        break;
      }
      case "<": {
        dir = [-1, 0];
        break;
      }
    }

    const next = extGrid[y + dir[1]]?.[x + dir[0]];
    if (!next) return;
    if (next === "#") return;
    if (next === ".") {
      // move
      const [x2, y2] = [x + dir[0], y + dir[1]];
      extGrid[y][x] = ".";
      extGrid[y2][x2] = "@";
      extRobot = [x2, y2];
    } else {
      // must have hit a box
      const boxUpdates = updateBoxes({ x, y, dir });

      if (boxUpdates.length === 0) return;

      console.debug({ boxUpdates });

      boxUpdates.forEach((box) => {
        extGrid[box.y][box.x] = ".";
        extGrid[box.y][box.x + 1] = ".";
      });

      boxUpdates.forEach((box) => {
        const [x1, y1] = [box.x + dir[0], box.y + dir[1]];

        extGrid[y1][x1] = "[";
        extGrid[y1][x1 + 1] = "]";

        box.y = y1;
        box.x = x1;
      });
      const [x2, y2] = [x + dir[0], y + dir[1]];
      extGrid[y][x] = ".";
      extGrid[y2][x2] = "@";
      extRobot = [x2, y2];
    }
  });

  console.debug("\n" + extGrid.map((row) => row.join("")).join("\n"));

  const p2 = boxes.map(({ x, y }) => 100 * y + x).reduce(sum);

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
