function calcAdj(
  x: number,
  y: number,
  width: number,
  height: number,
  grid: string[][],
  step: number
) {
  const vector = [
    //top
    [-1, -1],
    [0, -1],
    [1, -1],

    //middle
    [-1, 0],
    [0, 0],
    [1, 0],

    //bottom
    [-1, 1],
    [0, 1],
    [1, 1]
  ];

  const fill =
    step === 0
      ? "."
      : step % 2 === 1
      ? algo[0]
      : algo[
          parseInt(
            Array.from({ length: 9 }, () => (algo[0] === "#" ? "1" : "0")).join(
              ""
            ),
            2
          )
        ];

  return vector
    .map(([dx, dy]) => ({ x: x + dx, y: y + dy }))
    .map(({ x, y }) => {
      if (grid[y]) return grid[y][x] || fill;

      return fill;
    });
}

const input = await Deno.readTextFile("./input/day-20.in");
// const input = await Deno.readTextFile("./input/example.in");

const [algoStr, rows] = input.split("\n\n");

const algo = algoStr.split("");

const grid = rows.split("\n").map((row) => row.split(""));

const pad = (grid: string[][], step = 0) => {
  const width = grid[0].length;

  const fill =
    step === 0
      ? "."
      : step % 2 === 1
      ? algo[0]
      : algo[
          parseInt(
            Array.from({ length: 9 }, () => (algo[0] === "#" ? "1" : "0")).join(
              ""
            ),
            2
          )
        ];

  const result = [
    Array.from({ length: width }, () => fill),
    ...grid,
    Array.from({ length: width }, () => fill)
  ];

  return result.map((row) => [fill, ...row, fill]);
};

const join = (grid: string[][]) => {
  let result = "";

  for (const row of grid) {
    result = `${result}\n${row.join("")}`;
  }
  return result;
};

const glowingPixels = (grid: string[][]) =>
  growing.reduce((prev, row) => {
    return prev + row.reduce((acc, b) => (b === "#" ? acc + 1 : acc), 0);
  }, 0);

let it = 0;

let growing = pad(grid, it);

// console.log(join(growing));

while (1) {
  it += 1;

  if (it > 50) {
    break;
  }

  const width = growing[0].length;
  const height = growing.length;
  //   console.log({ width, height });

  const updates: { x: number; y: number; next: string }[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const adj = calcAdj(x, y, width, height, growing, it - 1);

      const index = parseInt(
        adj.map((c) => (c === "#" ? "1" : "0")).join(""),
        2
      );

      const next = algo[index];

      updates.push({ x, y, next });
    }
  }

  updates.forEach(({ x, y, next }) => {
    growing[y][x] = next;
  });

  growing = pad(growing, it);

  if (it == 2) {
    // after second simulation
    /**
     * Part One
     */
    console.log("Part One:", glowingPixels(growing));
  }
  //   console.log(join(growing));
}

/**
 * Part Two
 */
console.log("Part Two:", glowingPixels(growing));
