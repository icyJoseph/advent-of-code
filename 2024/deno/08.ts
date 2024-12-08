const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (isDebug) {
    console.log("Debug Mode Active");
  }

  /**
   * Part One
   */

  type Point = { x: number; y: number };
  type Ant = Point & { cell: string; dist: number };

  const grid = input.split("\n").map((row, y) => {
    return row.split("").map((cell, x) => ({
      cell,
      x,
      y,
      geo: [] as Ant[],
    }));
  });

  const flatGrid = grid.flat();

  const antennas = flatGrid.filter(({ cell }) => cell !== ".");

  const manhDist = (from: Point, to: Point) =>
    Math.abs(from.x - to.x) + Math.abs(from.y - to.y);

  flatGrid.forEach((entry) => {
    entry.geo = antennas.map((ant) => {
      return { ...ant, dist: manhDist(entry, ant) };
    });
  });

  const findAntiNodes = (
    entry: {
      x: number;
      y: number;
      cell: string;
      geo: Ant[];
    },
    distanceCmp: (lhs: Ant, rhs: Ant) => boolean = () => true
  ) => {
    return entry.geo.flatMap((ant, index, src) => {
      const slope = (entry.x - ant.x) / (entry.y - ant.y);
      const delta = entry.cell !== "." ? 0 : 1;

      return src
        .slice(index + delta)
        .filter((other) => other.cell === ant.cell)
        .map((other) => {
          const otherSlope = (entry.x - other.x) / (entry.y - other.y);

          if (slope === otherSlope && distanceCmp(ant, other)) {
            return entry;
          } else {
            return null;
          }
        })
        .filter(<T>(val: T | null): val is T => !!val);
    });
  };

  const distCmp = (ant: Ant, other: Ant) =>
    other.dist * 2 === ant.dist || ant.dist * 2 === other.dist;

  console.log(
    "Part 1:",
    new Set(flatGrid.flatMap((entry) => findAntiNodes(entry, distCmp))).size
  );

  /**
   * Part Two
   */

  console.log(
    "Part 2:",
    new Set(flatGrid.flatMap((entry) => findAntiNodes(entry))).size
  );
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  console.log("Day", filename);

  if (isExample) {
    console.log("Example");
    await solve(`./input/example.in`);
    console.log("---");
  } else {
    await solve(`./input/${filename}.in`);
  }
}

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);
