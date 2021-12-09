const input = await Deno.readTextFile("./input/day-9.in");

// const input = await Deno.readTextFile("./input/example.in");

const rows = input.split("\n");

const height = rows.length;
const width = rows[0].length;

const grid = rows.map((row) => row.split("").map(Number));

const adj = calcAdj(width, height);

const origins = [];

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const value = grid[y][x];

    const adjacent = adj[norm(x, y, width)].map((v) => {
      const { x, y } = invNorm(v, width);
      return grid[y][x];
    });

    const isLow = adjacent.every((v) => v > value);

    if (isLow) {
      origins.push({ x, y });
    }
  }
}

/**
 * Part One
 */
console.log(
  "Part One:",
  origins.map(({ x, y }) => grid[y][x] + 1).reduce((a, b) => a + b, 0)
);

/**
 * Part Two
 */

const flatGrid = flatten2dMatrix(grid);

const basins = [];

for (const { x, y } of origins) {
  const distances = bfs(norm(x, y, width), adj, flatGrid, width * height);
  const size = distances.filter((x) => x > 0).length + 1;

  basins.push(size);
}

basins.sort((a, b) => b - a);

console.log(
  "Part Two:",
  basins.slice(0, 3).reduce((a, b) => a * b, 1)
);

function norm(x: number, y: number, width: number) {
  return x + y * width;
}

function invNorm(normal: number, width: number) {
  return { x: normal % width, y: Math.floor(normal / width) };
}

function createMatrix<T>(size: number, init: () => T): T[] {
  return Array.from({ length: size }, init);
}

function flatten2dMatrix<T>(matrix: T[][]): T[] {
  const result: T[] = [];

  for (let y = 0; y < matrix.length; y++) {
    const row = matrix[y];
    result.push(...row);
  }

  return result;
}

function calcAdj(width: number, height: number) {
  const adj = createMatrix<number[]>(width * height, () => []);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = norm(x, y, width);
      if (x > 0) {
        // down
        adj[index].push(norm(x - 1, y, width));
      }
      if (y + 1 < height) {
        // right
        adj[index].push(norm(x, y + 1, width));
      }
      if (x + 1 < width) {
        // left
        adj[index].push(norm(x + 1, y, width));
      }
      if (y > 0) {
        // up
        adj[index].push(norm(x, y - 1, width));
      }
    }
  }

  return adj;
}

export function bfs(
  start: number,
  adj: number[][],
  grid: number[],
  size: number
) {
  const q: number[] = [];
  const visited = createMatrix(size, () => false);
  const distance = createMatrix(size, () => 0);

  visited[start] = true;
  distance[start] = 0;
  q.push(start);

  while (true) {
    const current = q.shift();

    if (current == null) break;

    for (const vec of adj[current]) {
      if (visited[vec]) continue;

      visited[vec] = true;

      if (grid[vec] === 9) continue;

      distance[vec] = distance[current] + 1;

      q.push(vec);
    }
  }

  return distance;
}
