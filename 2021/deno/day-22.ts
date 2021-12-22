const input = await Deno.readTextFile("./input/day-22.in");
// const input = await Deno.readTextFile("./input/example.in");

const rows = input.split("\n").map((row) => row.split(" "));

/**
 * Part One
 */

const createRange = (rg: number[], low = -50, high = 50) => {
  const [from, to] = rg;

  const upper = Math.min(to, high);
  const lower = Math.max(low, from);

  return Array.from({ length: upper - lower + 1 }, (_, i) => lower + i);
};

const table: Record<string, number> = {};

for (let z = -50; z <= 50; z++) {
  for (let y = -50; y <= 50; y++) {
    for (let x = -50; x <= 50; x++) {
      table[`${x}:${y}:${z}`] = 0;
    }
  }
}
for (const row of rows) {
  const [command, coords] = row;

  const [xRange, yRange, zRange] = coords.split(",").map((rg) => {
    const [dir, range] = rg.split("=");

    return range.split("..").map(Number);
  });

  for (const z of createRange(zRange)) {
    for (const y of createRange(yRange)) {
      for (const x of createRange(xRange)) {
        if (table[`${x}:${y}:${z}`] === undefined) continue;

        table[`${x}:${y}:${z}`] = command === "on" ? 1 : 0;
      }
    }
  }
}

console.log("Part One:", Object.values(table).filter((n) => n === 1).length);

/**
 * Part Two
 */

/**
 * Helpers
 */

type Range = [from: number, to: number];
type Cuboid = [Range, Range, Range];

const calcVolume = ([xr, yr, zr]: Cuboid) =>
  [xr, yr, zr].reduce((prev, [lower, upper]) => prev * (upper - lower + 1), 1);

const axes = [0, 1, 2] as const;

const slice = (cuboid: Cuboid, overlap: Cuboid): Cuboid[] => {
  let leftover = cuboid;

  const result: Cuboid[] = [];

  for (const axis of axes) {
    // For this axis:
    // from where the cuboid starts, until the lower overlap face starts
    const before: Range = [leftover[axis][0], overlap[axis][0] - 1];
    // from where the upper overlap face ends, to the end of the cuboid
    const after: Range = [overlap[axis][1] + 1, leftover[axis][1]];

    // keep those that go upwards, relative to this axis
    // and using the leftover cuboid, replace the new bounds
    const newCuboids: Cuboid[] = [before, after]
      .filter(([from, to]) => to >= from)
      .map(([from, to]) => {
        const newCuboid: Cuboid = [leftover[0], leftover[1], leftover[2]];

        newCuboid[axis] = [from, to];

        return newCuboid;
      });

    result.push(...newCuboids);

    const [from, to] = overlap[axis];

    leftover[axis] = [from, to];
  }

  console.assert(
    leftover.flat(1).join("") === overlap.flat(1).join(""),
    "Leftover does not match overlap"
  );

  return result;
};

// remove the center from a 3x3x3 cube
console.assert(
  slice(
    [
      [0, 2],
      [0, 2],
      [0, 2]
    ],
    [
      [1, 1],
      [1, 1],
      [1, 1]
    ]
  ).reduce((prev, curr) => prev + calcVolume(curr), 0) === 26,
  "Volumen after slice is not correct"
);

// remove a corner from a 3x3x3 cube
console.assert(
  slice(
    [
      [0, 2],
      [0, 2],
      [0, 2]
    ],
    [
      [0, 0],
      [0, 0],
      [0, 0]
    ]
  ).reduce((prev, curr) => prev + calcVolume(curr), 0) === 26,
  "Volumen after slice is not correct"
);

const rangeOverlap = (left: number[], right: number[]) => {
  return left[0] <= right[1] && left[1] >= right[0];
};

const haveOverlap = (left: Cuboid, right: Cuboid) =>
  rangeOverlap(left[0], right[0]) &&
  rangeOverlap(left[1], right[1]) &&
  rangeOverlap(left[2], right[2]);

function intersectAxis(left: Range, right: Range): Range {
  return [Math.max(left[0], right[0]), Math.min(left[1], right[1])];
}

const calcOverlapCuboid = (cuboid: Cuboid, other: Cuboid): Cuboid => {
  return [
    intersectAxis(cuboid[0], other[0]),
    intersectAxis(cuboid[1], other[1]),
    intersectAxis(cuboid[2], other[2])
  ];
};

const fracture = (cuboid: Cuboid, other: Cuboid): Cuboid | Cuboid[] => {
  if (!haveOverlap(cuboid, other)) return cuboid;

  const overlap = calcOverlapCuboid(cuboid, other);

  return slice(cuboid, overlap);
};

type Instruction = { command: string; cuboid: Cuboid };

const range = (rg: string): Range => {
  const [, range] = rg.split("=");

  const [lower, upper] = range.split("..").map(Number);

  return [lower, upper];
};

const isCuboid = (value: Cuboid | Cuboid[]): value is Cuboid => {
  const flat = value.flat(1);

  return flat.length === 6 && flat.every((n) => typeof n === "number");
};

/**
 * Actual solution
 */

const instructions: Instruction[] = rows.map((row) => {
  const [command, coords] = row;

  const raw = coords.split(",");

  if (raw.length !== 3) throw new Error("Only x,y,z accepted");

  const [x, y, z] = raw;

  const cuboid: Cuboid = [range(x), range(y), range(z)];

  return { command, cuboid };
});

let cuboids: Cuboid[] = [];

for (const instruction of instructions) {
  cuboids = cuboids.reduce((prev: Cuboid[], cubiod) => {
    const result = fracture(cubiod, instruction.cuboid);

    return isCuboid(result) ? [...prev, result] : [...prev, ...result];
  }, []);

  if (instruction.command === "on") {
    cuboids.push(instruction.cuboid);
  }
}

console.log(
  "Part Two:",
  cuboids.map(calcVolume).reduce((acc, curr) => acc + curr)
);
