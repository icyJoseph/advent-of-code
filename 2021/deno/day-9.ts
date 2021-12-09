const input = await Deno.readTextFile("./input/day-9.in");

// const input = await Deno.readTextFile("./input/example.in");

const rows = input.split("\n");

const height = rows.length;
const width = rows[0].length;

const grid = flatten2dMatrix(rows.map((row) => row.split("").map(Number)));

const adj = calcAdj(width, height);

const origins: number[] = [];

grid.forEach((value, index) => {
  const adjacent_values = adj[index].map((adj_index) => {
    return grid[adj_index];
  });

  if (adjacent_values.every((v) => v > value)) {
    origins.push(index);
  }
});

/**
 * Part One
 */
console.log(
  "Part One:",
  origins.map((index) => grid[index] + 1).reduce((a, b) => a + b, 0)
);

/**
 * Part Two
 */

const basins = [];

for (const index of origins) {
  const distances = bfs(index, adj, grid, width * height);
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
