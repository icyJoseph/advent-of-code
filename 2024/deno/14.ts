const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (isDebug) {
    console.log("Debug Mode Active");
  }

  /**
   * Part One
   */

  let robots = input.split("\n").map((row, index) => {
    const [posSpec, vecSpec] = row.split(" ");
    const [x, y] = posSpec.replace("p=", "").split(",").map(Number);
    const [dx, dy] = vecSpec.replace("v=", "").split(",").map(Number);

    return { x, y, dx, dy, id: index + 1 };
  });

  const width = isExample ? 11 : 101;
  const height = isExample ? 7 : 103;

  function circular(n: number, step: number, bound: number) {
    const res = n + step;
    if (res < 0) return bound + res;
    if (res >= bound) return res - bound;
    return res;
  }

  let sim = 0;

  while (1) {
    if (sim === 100) break;
    robots.forEach((robot, index) => {
      robots[index].x = circular(robot.x, robot.dx, width);
      robots[index].y = circular(robot.y, robot.dy, height);
    });

    sim++;
  }
  const middle = { x: Math.floor(width / 2), y: Math.floor(height / 2) };

  const q1 = robots.filter((robot) => robot.x < middle.x && robot.y < middle.y);
  const q2 = robots.filter((robot) => robot.x > middle.x && robot.y < middle.y);
  const q3 = robots.filter((robot) => robot.x < middle.x && robot.y > middle.y);
  const q4 = robots.filter((robot) => robot.x > middle.x && robot.y > middle.y);

  console.log("Part 1:", q1.length * q2.length * q3.length * q4.length);

  if (isExample) return;

  /**
   * Part Two
   */

  robots = input.split("\n").map((row, index) => {
    const [posSpec, vecSpec] = row.split(" ");
    const [x, y] = posSpec.replace("p=", "").split(",").map(Number);
    const [dx, dy] = vecSpec.replace("v=", "").split(",").map(Number);

    return { x, y, dx, dy, id: index + 1 };
  });

  const adj = makeAdj(width, height);

  sim = 0;

  while (true) {
    robots.forEach((robot, index) => {
      robots[index].x = circular(robot.x, robot.dx, width);
      robots[index].y = circular(robot.y, robot.dy, height);
    });

    sim++;

    if (searchTree(robots, adj, width, height)) {
      break;
    }
  }
  console.log("Part 2:", sim);

  if (isDebug) {
    printTree(robots, width, height);
  }
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

function coordToIndex(x: number, y: number, width: number) {
  return x + y * width;
}

function makeAdj(width: number, height: number) {
  const adj: number[][] = Array.from({ length: height * width }, () => []);

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

      deltas.forEach(([dx, dy]) => {
        const x1 = x + dx;
        const y1 = y + dy;

        if (0 <= x1 && x1 < width && 0 <= y1 && y1 < height) {
          adj[index].push(coordToIndex(x1, y1, width));
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
  adj: number[][];
  grid: T[];
  size: number;
}) {
  const q: number[] = [];
  q.push(start);

  const area = new Set<number>();
  area.add(start);

  while (true) {
    const current = q.shift();

    if (current == null) break;

    // for each first adj of current
    for (const index of adj[current]) {
      if (grid[index] !== "#") continue;

      if (area.has(index)) continue;

      area.add(index);
      q.push(index);
    }
  }

  return area.size;
}

function searchTree(
  bots: { x: number; y: number }[],
  adj: number[][],
  width: number,
  height: number
) {
  const grid = Array.from({ length: height * width }, () => ".");

  bots.forEach(({ x, y }) => {
    grid[coordToIndex(x, y, width)] = "#";
  });

  for (const { x, y } of bots) {
    const area = bfs({
      start: coordToIndex(x, y, width),
      grid,
      size: width * height,
      adj,
    });

    // If there are a bunch of bots grouped, guess that is it!
    if (area > 100) return true;
  }

  return false;
}

function printTree(
  bots: { x: number; y: number }[],
  width: number,
  height: number
) {
  const grid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ".")
  );

  bots.forEach(({ x, y }) => {
    grid[y][x] = "#";
  });

  console.log(grid.map((row) => row.join("")).join("\n"));
}
