const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

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

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const grid = input.split("\n").map((row, y) => {
    return row
      .split("")
      .map((value, x) => ({ value, x, y }));
  });

  type Coord = { x: number; y: number };
  type Cell = Coord & { value: string };

  const walkInOneDirection = (
    map: Cell[][],
    start: Coord,
    initialHeading: number[]
  ): Map<Cell, number> => {
    const width = map[0].length;
    const height = map.length;

    const q = [map[start.y][start.x]];
    const distances = new Map();
    const visited = new Set();

    distances.set(map[start.y][start.x], 0);

    let heading = [...initialHeading];

    while (q.length !== 0) {
      const pipe = q.pop();
      if (!pipe) throw new Error("foo");

      if (visited.has(pipe)) continue;

      visited.add(pipe);
      const [dx, dy] = heading;

      if (dx + pipe.x < 0 || dx + pipe.x >= width) continue;
      if (dy + pipe.y < 0 || dy + pipe.y >= height)
        continue;

      const cell = map[pipe.y + dy][pipe.x + dx];
      switch (cell.value) {
        case "J":
        case "F":
          heading = [-dy, -dx];
          break;
        case "7":
        case "L":
          heading = [dy, dx];
          break;
      }

      distances.set(cell, distances.get(pipe) + 1);

      q.push(cell);
    }

    return distances;
  };

  const rowS = grid.findIndex((row) =>
    row.find((cell) => cell.value === "S")
  );
  const colS = grid[rowS].findIndex(
    (cell) => cell.value === "S"
  );

  const distances = walkInOneDirection(
    grid,
    grid[rowS][colS],
    [0, 1]
  );

  const [backToStart] = [...distances.values()].sort(
    (a, b) => b - a
  );

  console.log("Part 1:", backToStart / 2);
  /**
   * Part Two
   */
  type ExtendedCell = {
    value: string;
    ancestor: {
      value: string;
      x: number;
      y: number;
    };
    isCenter?: boolean;
  };

  const expanded = grid
    .map((row) => {
      const acc: ExtendedCell[][] = [];

      for (let iy = 0; iy < 3; iy++) {
        acc.push(
          row.flatMap((cell) => [
            {
              value: " ",
              ancestor: cell,
            },
            {
              value: iy === 1 ? cell.value : " ",
              ancestor: cell,
              isCenter: iy === 1,
            },
            {
              value: " ",
              ancestor: cell,
            },
          ])
        );
      }
      return acc;
    })
    .flat();

  expanded.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.isCenter) {
        switch (cell.ancestor.value) {
          case "S":
            [
              [-1, 0],
              [1, 0],
              [0, -1],
              [0, 1],
              [0, 0],
            ].forEach(([dx, dy]) => {
              const [cX, cY] = [x + dx, y + dy];
              if (cX < 0 || cX >= row.length) return;
              if (cY < 0 || cY >= expanded.length) return;

              expanded[cY][cX].value = "#";
            });
            return;
          case "|":
            [
              [0, -1],
              [0, 1],
              [0, 0],
            ].forEach(([dx, dy]) => {
              const [cX, cY] = [x + dx, y + dy];
              if (cX < 0 || cX >= row.length) return;
              if (cY < 0 || cY >= expanded.length) return;

              expanded[cY][cX].value = "#";
            });
            return;
          case "-":
            [
              [-1, 0],
              [1, 0],
              [0, 0],
            ].forEach(([dx, dy]) => {
              const [cX, cY] = [x + dx, y + dy];
              if (cX < 0 || cX >= row.length) return;
              if (cY < 0 || cY >= expanded.length) return;

              expanded[cY][cX].value = "#";
            });
            return;
          case "L":
            [
              [0, -1],
              [1, 0],
              [0, 0],
            ].forEach(([dx, dy]) => {
              const [cX, cY] = [x + dx, y + dy];
              if (cX < 0 || cX >= row.length) return;
              if (cY < 0 || cY >= expanded.length) return;

              expanded[cY][cX].value = "#";
            });
            return;
          case "J":
            [
              [0, -1],
              [-1, 0],
              [0, 0],
            ].forEach(([dx, dy]) => {
              const [cX, cY] = [x + dx, y + dy];
              if (cX < 0 || cX >= row.length) return;
              if (cY < 0 || cY >= expanded.length) return;

              expanded[cY][cX].value = "#";
            });
            return;
          case "7":
            [
              [-1, 0],
              [0, 1],
              [0, 0],
            ].forEach(([dx, dy]) => {
              const [cX, cY] = [x + dx, y + dy];
              if (cX < 0 || cX >= row.length) return;
              if (cY < 0 || cY >= expanded.length) return;

              expanded[cY][cX].value = "#";
            });
            return;

          case "F":
            [
              [0, 1],
              [1, 0],
              [0, 0],
            ].forEach(([dx, dy]) => {
              const [cX, cY] = [x + dx, y + dy];
              if (cX < 0 || cX >= row.length) return;
              if (cY < 0 || cY >= expanded.length) return;

              expanded[cY][cX].value = "#";
            });
            return;

          case ".":
            expanded[y][x].value = " ";
        }
      }
    });
  });

  if (Deno.args.includes("--example")) {
    console.log(
      expanded
        .map((row) =>
          row.map((cell) => cell.value).join("")
        )
        .join("\n")
    );
  }

  function bfs({
    start,
    adj,
    grid,
  }: {
    start: number;
    adj: number[][];
    grid: ExtendedCell[];
  }) {
    const q: number[] = [];
    const visited = new Set();
    const outside = new Set();

    visited.add(start);
    q.push(start);

    while (true) {
      const current = q.shift();

      if (current == null) break;

      for (const vec of adj[current]) {
        if (visited.has(vec)) continue;

        visited.add(vec);

        if (grid[vec].value === "#") continue;

        outside.add(grid[vec].ancestor);

        q.push(vec);
      }
    }

    return outside;
  }

  const outside = bfs({
    start: 0,
    adj: calcAdj(expanded[0].length, expanded.length),
    grid: expanded.flat(),
  });

  const total = grid.length * grid[0].length;
  console.log("Part 2:", total - outside.size);
};

console.log("Day", filename);
if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
