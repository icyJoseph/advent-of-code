const input = await Deno.readTextFile("./input/day-11.in");
// const input = await Deno.readTextFile("./input/example.in");

function calcAdj(x: number, y: number, width: number, height: number) {
  const vector = [0, 1, -1];

  return vector
    .map((dx) => vector.map((dy) => [dx, dy]))
    .flat(1)
    .filter(([dx, dy]) => Math.abs(dx) + Math.abs(dy) > 0)
    .map(([dx, dy]) => ({ x: x + dx, y: y + dy }))
    .filter(
      (coord) =>
        coord.x >= 0 && coord.x < width && coord.y >= 0 && coord.y < height
    );
}

const createOctopus = (value: number, x: number, y: number) => {
  let _value = value;

  return {
    x,
    y,
    get value() {
      return _value;
    },
    get hash() {
      return `${x}:${y}`;
    },
    reset() {
      _value = 0;
    },
    radiate() {
      _value += 1;
    }
  };
};

type Octopus = ReturnType<typeof createOctopus>;

const grid = input
  .split("\n")
  .map((row, y) =>
    row.split("").map((value, x) => createOctopus(Number(value), x, y))
  );

const width = grid[0].length;
const height = grid.length;

let total_flashes = 0;

let step = 0;

while (1) {
  if (grid.every((row) => row.every((cell) => cell.value === 0))) {
    break;
  }
  step += 1;

  let scheduled: Octopus[] = [];

  for (const row of grid) {
    for (const oct of row) {
      oct.radiate();

      if (oct.value > 9) {
        scheduled.push(oct);
      }
    }
  }

  const flashed = new Set<Octopus>();

  while (1) {
    const next = scheduled.shift();

    if (next === undefined) {
      break;
    }

    if (flashed.has(next)) {
      continue;
    }

    flashed.add(next);

    const adj = calcAdj(next.x, next.y, width, height);

    for (const { x, y } of adj) {
      // radiate neighbors
      const oct = grid[y][x];
      oct.radiate();

      if (oct.value > 9) {
        if (!flashed.has(oct)) {
          scheduled.push(oct);
        }
      }
    }
  }

  total_flashes += flashed.size;

  /**
   * Part One
   */

  if (step === 100) {
    console.log("Part One:", total_flashes);
  }

  for (const oct of [...flashed]) {
    oct.reset();
  }
}

/**
 * Part Two
 */
console.log("Part Two:", step);
