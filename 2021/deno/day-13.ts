const input = await Deno.readTextFile("./input/day-13.in");
// const input = await Deno.readTextFile("./input/example.in");

const [dots, instructions] = input.split("\n\n");

const coords = dots
  .split("\n")
  .map((row) => {
    const [x, y] = row.split(",");
    return { x: Number(x), y: Number(y) };
  })
  .flat(1);

const foldV = (xf: number, grid: { x: number; y: number }[]) => {
  return grid.map(({ x, y }) => ({
    y,
    x: x > xf ? 2 * xf - x : x
  }));
};

const foldH = (yf: number, grid: { x: number; y: number }[]) => {
  return grid.map(({ x, y }) => ({
    x,
    y: y > yf ? 2 * yf - y : y
  }));
};

/**
 * Part Two
 */

const print = (grid: { x: number; y: number }[]) => {
  const width = 1 + Math.max(...grid.map(({ x }) => x));
  const height = 1 + Math.max(...grid.map(({ y }) => y));

  const board = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => " ")
  );

  grid.forEach(({ x, y }) => {
    board[y][x] = "#";
  });

  for (const row of board) {
    console.log(row.join(""));
  }
};

let it = 0;
let grid = coords.slice(0);

for (const inst of instructions.split("\n")) {
  const [dir, where] = inst.replace("fold along ", "").split("=");

  const fn = dir === "x" ? foldV : foldH;

  grid = fn(Number(where), grid);

  if (it === 0) {
    const visible: Set<string> = new Set();
    grid.forEach(({ x, y }) => visible.add(`${x},${y}`));

    /**
     * Part One
     */
    console.log("Part One:", visible.size);
  }

  it += 1;
}

console.log("Part Two:");
print(grid);
