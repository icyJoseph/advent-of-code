const input = await Deno.readTextFile("./input/seventeen.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const triplet = [0, 1, -1];

// generate unit vector permutations for 2d, 3d, and 4d
const d2 = triplet.map((x) => triplet.map((y) => [x, y]));

const d3 = triplet
  .map((z) => d2.map((vec) => vec.map((v) => [...v, z])))
  .flat(2);

const d4 = triplet.map((w) => d3.map((vec) => [...vec, w])).flat(1);

const notCenter = (coords: number[]) => !coords.every((x) => x === 0);

// 3 dimension neighbor unit vectors
const n3d = d3.filter(notCenter);

// 4 dimension neighbor unit vectors
const n4d = d4.filter(notCenter);

let allCells = new Map();

type Coord = { [key in "x" | "y" | "z" | "w"]: number };
type Cell = "#" | ".";

const node = (_initial: Cell, { x, y, z, w }: Coord, pending = false) => {
  let value = _initial;
  let next = _initial;
  let initial = _initial;
  const coords = { x, y, z, w };
  let isPending = pending;

  const getNeighbors = (directions: number[][]) =>
    directions.map(([dx, dy, dz, dw = 0]) => {
      const [nx, ny, nz, nw] = [x + dx, y + dy, z + dz, w + dw];
      const key = [nx, ny, nz, nw].join(".");
      let cell = allCells.get(key);

      if (!cell) {
        cell = node(".", { x: nx, y: ny, z: nz, w: nw }, true);
        allCells.set(key, cell);
      }
      return cell;
    });

  const simulate = (directions: number[][]) => {
    const around = getNeighbors(directions);

    const activeAround = around
      .filter((n) => n)
      .filter((cell) => cell.getValue() === "#");

    if (getValue() === "#") {
      if (activeAround.length === 2 || activeAround.length === 3) {
        prepare("#");
      } else {
        prepare(".");
      }
    } else {
      if (activeAround.length === 3) {
        prepare("#");
      }
    }
  };

  const getValue = () => value;
  const getIsPending = () => isPending;

  const prepare = (_next: "#" | ".") => {
    next = _next;
  };
  const update = () => {
    value = next;
    isPending = false;
  };

  const reset = () => {
    value = initial;
    next = initial;
  };

  return {
    value,
    getIsPending,
    getValue,
    next,
    coords,
    update,
    simulate,
    reset
  };
};

/**
 * Part One
 */

input.forEach((row, y) =>
  row.split("").forEach((n: string, x) => {
    if (n !== "." && n !== "#") {
      throw new Error("Bad cell value");
    }
    const cell = node(n, { x, y, z: 0, w: 0 });
    allCells.set(`${x}.${y}.0.0`, cell);
  })
);

let cycle = 0;
let maxCycles = 5;

while (1) {
  // simulate
  console.log({ cycle });

  [...allCells.values()].forEach((cell) => cell.simulate(n3d));

  [...allCells.values()]
    .filter((cell) => cell.getIsPending())
    .forEach((cell) => cell.simulate(n3d));

  [...allCells.values()].forEach((cell) => cell.update());

  if (cycle === maxCycles) {
    break;
  }
  cycle = cycle + 1;
}

console.log(
  "Part One:",
  [...allCells.values()].filter((x) => x.getValue() === "#").length
);

/**
 * Part Two
 */

// [...allCells.values()].forEach((cell) => cell.reset());

// Easier to instance a grid again

allCells.clear();

input.forEach((row, y) =>
  row.split("").forEach((n, x) => {
    if (n !== "." && n !== "#") {
      throw new Error("Bad cell value");
    }
    const cell = node(n, { x, y, z: 0, w: 0 });
    allCells.set(`${x}.${y}.0.0`, cell);
  })
);

let cycle4d = 0;

while (1) {
  console.log({ cycle4d });

  [...allCells.values()].forEach((cell) => cell.simulate(n4d));

  [...allCells.values()]
    .filter((cell) => cell.getIsPending())
    .forEach((cell) => cell.simulate(n4d));

  [...allCells.values()].forEach((cell) => cell.update());

  if (cycle4d === maxCycles) {
    break;
  }
  cycle4d = cycle4d + 1;
}

console.log(
  "Part Two:",
  [...allCells.values()].filter((x) => x.getValue() === "#").length
);
