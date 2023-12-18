const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

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
    .filter(([x, y]) => Math.abs(x) + Math.abs(y) !== 2);

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

function bfs<T>({
  start,
  adj,
  grid,
  size,
}: {
  start: number;
  adj: number[][];
  grid: T[];
  size: number;
}) {
  const q: number[] = [];
  const visited = matrix(size, () => false);
  let total = 1;

  visited[start] = true;
  q.push(start);

  while (true) {
    const current = q.shift();

    if (current == null) break;

    for (const vec of adj[current]) {
      if (visited[vec]) continue;

      visited[vec] = true;
      if (grid[vec] === "#") continue;

      total++;

      q.push(vec);
    }
  }

  return total;
}

// deno-lint-ignore no-unused-vars
const pretty = (grid: string[][]) =>
  grid
    .map((row) => row.map((cell) => cell).join(""))
    .join("\n");

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const instructions = input.split("\n").map((row) => {
    const [dir, steps, color] = row.split(" ");

    return {
      dir,
      steps: Number(steps),
      color: color.replace("(", "").replace(")", ""),
    };
  });

  const grid = [];

  const current = { x: 0, y: 0 };

  grid.push({ ...current });
  for (const inst of instructions) {
    switch (inst.dir) {
      case "U":
        for (let i = 0; i < inst.steps; i++) {
          current.y -= 1;
          grid.push({ ...current });
        }
        break;
      case "D":
        for (let i = 0; i < inst.steps; i++) {
          current.y += 1;
          grid.push({ ...current });
        }
        break;
      case "R":
        for (let i = 0; i < inst.steps; i++) {
          current.x += 1;
          grid.push({ ...current });
        }
        break;
      case "L":
        for (let i = 0; i < inst.steps; i++) {
          current.x -= 1;
          grid.push({ ...current });
        }
        break;
    }
  }

  const allX = grid.map(({ x }) => x);
  const allY = grid.map(({ y }) => y);

  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);

  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  const dGrid = grid.map(({ x, y }) => ({
    x: x - minX + 1,
    y: y - minY + 1,
  }));

  const mapW = width + 2;
  const mapH = height + 2;

  const map = Array.from({ length: mapH }, () =>
    Array.from({ length: mapW }, () => ".")
  );
  dGrid.forEach(({ x, y }) => (map[y][x] = "#"));

  const adj = calcAdj(mapW, mapH);

  const area = bfs({
    start: coordToIndex(0, 0, mapW),
    adj,
    size: mapW * mapH,
    grid: map.flat(),
  });

  console.log("Part 1:", mapW * mapH - area);
  /**
   * Part Two
   */
  const newInstructions = instructions.map(({ color }) => {
    const steps = color.slice(1, -1);
    const dirCode = color.slice(-1);
    let dir = "";

    // 0 means R, 1 means D, 2 means L, and 3 means U.
    if (dirCode === "0") {
      dir = "R";
    }

    if (dirCode === "1") {
      dir = "D";
    }
    if (dirCode === "2") {
      dir = "L";
    }
    if (dirCode === "3") {
      dir = "U";
    }

    return { steps: parseInt(steps, 16), dir };
  });

  const countBlocks = (
    instructions: Array<{ steps: number; dir: string }>
  ) => {
    const current = { x: 0, y: 0 };
    const vertices: Array<typeof current> = [];

    let perimeter = 0;

    for (const inst of instructions) {
      perimeter += inst.steps;

      switch (inst.dir) {
        case "U":
          current.y -= inst.steps;
          break;
        case "D":
          current.y += inst.steps;
          break;
        case "R":
          current.x += inst.steps;
          break;
        case "L":
          current.x -= inst.steps;
          break;
      }
      vertices.push({ ...current });
    }

    const area = vertices.reduce((acc, from, index) => {
      const to = vertices?.[index + 1] ?? { x: 0, y: 0 };

      // Shoelace formula
      return acc + ((from.y + to.y) * (from.x - to.x)) / 2;
    }, 0);

    // area is geometric, point at center of block
    // add half parts of the perimeter
    return area + perimeter / 2 + /* initial block */ 1;
  };

  console.log("Part 1.1:", countBlocks(instructions));
  console.log("Part 2:", countBlocks(newInstructions));
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
