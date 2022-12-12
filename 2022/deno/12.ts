const input = await Deno.readTextFile("./input/12.in");

/**
 * Part One
 */

const elevation = (ch: string) => ch.charCodeAt(0);

const coordToIndex = (x: number, y: number, width: number) => x + y * width;

const matrix = <T>(length: number, init: () => T) =>
  Array.from({ length }, init);

const inBound = (n: number, bound: number) => n >= 0 && n < bound;

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

export function bfs({
  start,
  end,
  adj,
  grid,
  size,
}: {
  start: number;
  end: number;
  adj: number[][];
  grid: number[];
  size: number;
}) {
  const q: number[] = [];
  const visited = matrix(size, () => false);
  const distance = matrix(size, () => 0);

  visited[start] = true;
  distance[start] = 0;
  distance[end] = Infinity;
  q.push(start);

  while (true) {
    const current = q.shift();

    if (current == null) break;

    for (const vec of adj[current]) {
      if (visited[vec]) continue;

      // only add node if the peak is lower
      const peak = grid[vec];
      const curr = grid[current];

      if (peak <= curr + 1) {
        visited[vec] = true;
        distance[vec] = distance[current] + 1;

        if (vec !== end) {
          q.push(vec);
        }
      }
    }
  }

  return distance;
}

const data = input.split("\n").map((row) => row.split(""));

const width = data[0].length;
const height = data.length;
const size = width * height;

const adj = calcAdj(width, height);

let start = 0;
let end = 0;

const grid = data
  .map((row, y) =>
    row.map((cell, x) => {
      if (cell === "S") {
        start = coordToIndex(x, y, width);
        return elevation("a");
      }

      if (cell === "E") {
        end = coordToIndex(x, y, width);
        return elevation("z");
      }

      return elevation(cell);
    })
  )
  .flat(1);

const distances = bfs({
  start,
  end,
  adj,
  grid,
  size,
});

console.log("Part one:", distances[end]);

/**
 * Part Two
 */

const roots = grid.reduce<number[]>((acc, curr, index) => {
  if (curr === elevation("a")) acc.push(index);

  return acc;
}, []);

const shortestPath = roots.reduce((current, start) => {
  const distances = bfs({
    start,
    end,
    adj,
    grid,
    size,
  });

  if (distances[end] < current) return distances[end];

  return current;
}, Infinity);

console.log("Part two:", shortestPath);
