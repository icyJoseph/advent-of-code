const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

type Coord = { x: number; y: number; z: number };
const toCoords = (str: string): Coord => {
  const [x, y, z] = str.split(",").map(Number);
  return { x, y, z };
};

type Range = [number, number];
type Cuboid = [Range, Range, Range];

const rangeOverlap = (left: Range, right: Range) => {
  return left[0] <= right[1] && left[1] >= right[0];
};

const haveOverlap = (left: Cuboid, right: Cuboid) =>
  rangeOverlap(left[0], right[0]) &&
  rangeOverlap(left[1], right[1]) &&
  rangeOverlap(left[2], right[2]);

type Brick = {
  index: number;
  coords: Cuboid;
};

const fall = (brick: Brick) => {
  brick.coords[2][0]--;
  brick.coords[2][1]--;
};

const undo = (brick: Brick) => {
  brick.coords[2][0]++;
  brick.coords[2][1]++;
};

const isSettled = (brick: Brick, grid: Brick[]) => {
  const atGround = brick.coords[2][0] === 1;

  if (atGround) return true;

  const others = grid.filter((other) => other !== brick);

  brick.coords[2][0]--;
  brick.coords[2][1]--;

  const overlaps = others.filter((other) =>
    haveOverlap(brick.coords, other.coords)
  );

  brick.coords[2][0]++;
  brick.coords[2][1]++;

  // touches something if it moves down
  if (overlaps.length !== 0) {
    return true;
  }

  return false;
};

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const bricks = input
    .split("\n")
    .map<Brick>((row, index) => {
      const [from, to] = row.split("~").map(toCoords);
      return {
        index,
        coords: [
          [from.x, to.x],
          [from.y, to.y],
          [from.z, to.z],
        ],
      };
    })
    .toSorted((lhs, rhs) => {
      return lhs.coords[2][0] - rhs.coords[2][0];
    });

  const pending: Brick[] = [];

  while (true) {
    bricks.forEach((brick) => {
      if (isSettled(brick, bricks)) {
        return;
      }

      // can be moved down without problem
      pending.push(brick);
    });

    // console.log(pending);

    if (pending.length === 0) break;

    pending.forEach((b) => fall(b));

    // console.log(bricks.map((b) => [b.index, b.coords[2]]));

    pending.length = 0;
  }

  //   console.log(bricks.map((b) => [b.index, b.coords[2]]));

  const supports = bricks.map((brick) => {
    const others = bricks.filter(
      (other) => other !== brick
    );

    fall(brick);

    const overlaps = others.filter((other) =>
      haveOverlap(brick.coords, other.coords)
    );

    undo(brick);

    return [brick, overlaps.map((b) => b)] as const;
  });

  const important = new Set(
    supports
      .filter(([, support]) => support.length === 1)
      .map(([, support]) => support)
      .flat()
  );

  console.log("Part 1:", bricks.length - important.size);

  /**
   * Part Two
   */

  let total = 0;

  //   supports.forEach((entry) => {
  //     // if entry disappears
  //     // const others = supports.filter(
  //     //   (other) => other !== entry
  //     // );

  //     // const reaction: number[] = [];
  //     // while (true) {
  //     //   const todo: number[] = [];

  //     //   if (todo.length === 0) break;
  //     // }

  //     // total += reaction.length;

  //     const gone:Set<Brick> = new Set()
  //     gone.add(entry[0])

  //     const delta = supports.filter(([other, supports])=> supports.every(b=> gone.has(b)))

  //     delta.forEach(d=>gone.add(d))

  //   });

  // TODO: Optimize using the above, to propagate change faster
  bricks.forEach((current, pos) => {
    console.log(current.index, pos, bricks.length);
    if (!important.has(current)) return;

    const local = new Set();
    const seed: Brick[] = JSON.parse(
      JSON.stringify(bricks)
    );
    const simulation = seed.filter(
      (b) => b.index !== current.index
    );

    while (true) {
      simulation.forEach((brick) => {
        if (isSettled(brick, simulation)) {
          return;
        }

        // can be moved down without problem
        pending.push(brick);
      });

      if (pending.length === 0) break;

      pending.forEach((b) => {
        fall(b);
        local.add(b);
      });

      pending.length = 0;
    }
    total += local.size;
  });

  console.log("Part 2:", total);
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
