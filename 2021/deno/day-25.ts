const input = await Deno.readTextFile("./input/day-25.in");
// const input = await Deno.readTextFile("./input/example.in");

function norm(x: number, y: number, width: number) {
  return x + y * width;
}

function invNorm(normal: number, width: number) {
  return { x: normal % width, y: Math.floor(normal / width) };
}

function calcAdj(index: number, width: number, height: number, type: string) {
  const adj: number[] = [];
  const { x, y } = invNorm(index, width);

  if (type === "v") {
    if (y + 1 < height) {
      // down
      adj.push(norm(x, y + 1, width));
    }

    if (y + 1 === height) {
      // down wrap around
      adj.push(norm(x, 0, width));
    }
  }

  if (type === ">") {
    if (x + 1 < width) {
      // right
      adj.push(norm(x + 1, y, width));
    }

    if (x + 1 === width) {
      // right wrap around
      adj.push(norm(0, y, width));
    }
  }

  return adj;
}

function flatten2dMatrix<T>(matrix: T[][]): T[] {
  const result: T[] = [];

  for (let y = 0; y < matrix.length; y++) {
    const row = matrix[y];
    result.push(...row);
  }

  return result;
}

function unflatten2dMatrix<T>(
  flatMatrix: T[],
  width: number,
  height: number
): T[][] {
  const result = [];

  for (let y = 0; y < height; y++) {
    const row = flatMatrix.slice(y * width, (y + 1) * width);
    result.push(row);
  }

  return result;
}

function print(grid: string[], width: number, height: number) {
  const m2d = unflatten2dMatrix(grid, width, height);

  for (const row of m2d) {
    console.log(row.join(""));
  }
}

function hash(grid: string[], width: number, height: number) {
  const m2d = unflatten2dMatrix(grid, width, height);

  let result = "";

  for (const row of m2d) {
    result = `${result}:${row.join("")}`;
  }

  return result;
}

const grid = input.split("\n").map((row) => row.split(""));

const height = grid.length;
const width = grid[0].length;

const map: string[] = flatten2dMatrix(grid);

const turns = [">", "v"];

let step = 0;

while (1) {
  const prev = hash(map, width, height);

  for (const type of turns) {
    let index = 0;

    const update: { index: number; next: number; type: string }[] = [];

    for (const item of map) {
      if (item !== type) {
        index += 1;
        continue;
      }

      const [next] = calcAdj(index, width, height, item);

      if (map[next] === ".") {
        update.push({ index, next, type });
      }

      index += 1;
    }

    update.forEach(({ index, next, type }) => {
      map[index] = ".";
      map[next] = type;
    });
  }

  step += 1;

  const after = hash(map, width, height);

  if (prev === after) break;

  print(map, width, height);
}

/**
 * Part One
 */
console.log("Part One:", step);
