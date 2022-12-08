const input = await Deno.readTextFile("./input/08.in");

/**
 * Part One
 */

const trees = input.split("\n").map((row) => row.split("").map(Number));

const visibility = (grid: number[][], y: number, x: number) => {
  const width = grid[0].length;
  const height = grid.length;

  const frame = [
    [0, -1],
    [-1, 0],
    [1, 0],
    [0, 1],
  ];

  const firstBlockedAt = frame
    .map(([dx, dy]) => {
      const Dy = [-y, height - 1 - y];
      const Dx = [-x, width - 1 - x];

      const distance = dx * Dx[Math.max(0, dx)] + dy * Dy[Math.max(0, dy)];

      return [dx, dy, distance];
    })
    .reduce<Record<string, number>>((prev, [dx, dy, dist]) => {
      const key = `${dy}.${dx}`;

      prev[key] = dist;

      return prev;
    }, {});

  let step = 1;
  const blockedDirs = new Set();

  while (true) {
    if (blockedDirs.size === frame.length) {
      // blocked in all dirs
      return [false, firstBlockedAt] as const;
    }

    const candidates = frame
      .map(([dx, dy]) => {
        return [x + dx * step, y + dy * step];
      })
      .filter(([nx, ny]) => {
        if (nx < 0 || ny < 0) {
          return false;
        }

        if (nx >= width || ny >= height) {
          return false;
        }

        return true;
      });

    // done with this x,y
    if (candidates.length === 0) {
      break;
    }

    candidates
      .filter(([nx, ny]) => {
        // trees that cover this point
        return grid[ny][nx] >= grid[y][x];
      })
      .forEach(([nx, ny]) => {
        const dx = Math.floor((nx - x) / step);
        const dy = Math.floor((ny - y) / step);

        const dir = `${dy}.${dx}`;

        if (blockedDirs.has(dir)) return;

        blockedDirs.add(dir);
        firstBlockedAt[dir] = step;
      });

    step += 1;
  }

  return [true, firstBlockedAt] as const;
};

const visibleCount = trees.reduce((prev, row, y, grid) => {
  const visibleInRow = row.filter((_, x) => visibility(grid, y, x)[0]);
  return prev + visibleInRow.length;
}, 0);

console.log("Part one:", visibleCount);

let max: number | null = null;

trees.forEach((row, y, grid) => {
  row.forEach((_, x) => {
    const cellScore = Object.values(visibility(grid, y, x)[1]).reduce(
      (a, b) => a * b
    );

    if (max === null || cellScore > max) {
      max = cellScore;
    }
  });
});

console.log("Part two:", max);

/**
 * Part Two
 */
