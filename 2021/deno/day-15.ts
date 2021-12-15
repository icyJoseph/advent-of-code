function norm(x: number, y: number, width: number) {
  return x + y * width;
}

function createMatrix<T>(size: number, init: () => T): T[] {
  return Array.from({ length: size }, init);
}

function calcAdj(width: number, height: number) {
  const adj = createMatrix<number[]>(width * height, () => []);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = norm(x, y, width);
      if (y + 1 < height) {
        // down
        adj[index].push(norm(x, y + 1, width));
      }
      if (x + 1 < width) {
        // right
        adj[index].push(norm(x + 1, y, width));
      }
      if (x > 0) {
        // left
        adj[index].push(norm(x - 1, y, width));
      }
      if (y > 0) {
        // up
        adj[index].push(norm(x, y - 1, width));
      }
    }
  }

  return adj;
}

function bfs(start: number, adj: number[][], map: number[], size: number) {
  const q: number[] = [];
  const visited = createMatrix(size, () => false);
  const risks = createMatrix(size, () => Infinity);

  visited[start] = true;
  risks[start] = 0;
  q.push(start);

  while (true) {
    const current = q.shift();

    if (current == null) break;

    for (const vec of adj[current]) {
      if (vec === start) continue;

      const next = risks[current] + map[vec];

      if (next < risks[vec]) {
        risks[vec] = next;
        q.push(vec);
        visited[vec] = true;
      }

      if (visited[vec]) continue;
    }
  }

  return risks;
}

const input = await Deno.readTextFile("./input/day-15.in");
// const input = await Deno.readTextFile("./input/example.in");

const rows = input.split("\n");

/**
 * Part One
 */
const height = rows.length;
const width = rows[0].length;

const grid = rows.map((row) => row.split("").map(Number)).flat(1);

const adj = calcAdj(width, height);

const start = 0;
const end = norm(width - 1, height - 1, width);

const paths = bfs(start, adj, grid, width * height);

console.log("Part One:", paths[end]);

/**
 * Part Two
 */
const megaGrid = Array.from({ length: 5 * height * 5 * width }, () => 0);

for (let y = 0; y < 5 * height; y++) {
  for (let x = 0; x < 5 * width; x++) {
    let value =
      Math.floor(y / height) +
      Math.floor(x / width) +
      grid[norm(x % width, y % height, width)];

    while (value > 9) {
      value = value - 9;
    }

    megaGrid[norm(x, y, 5 * width)] = value;
  }
}

const megaWidth = 5 * height;
const megaHeight = 5 * width;
const megaAdj = calcAdj(megaWidth, megaHeight);

const megaSize = megaWidth * megaHeight;
const megaPaths = bfs(start, megaAdj, megaGrid, megaSize);

const megaEnd = norm(megaWidth - 1, megaHeight - 1, megaWidth);

console.log("Part Two:", megaPaths[megaEnd]);
