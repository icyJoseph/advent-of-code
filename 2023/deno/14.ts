const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const rotateCW = <T>(grid: T[][]) => {
  return grid.reduce<T[][]>((acc, row, rowIndex) => {
    return row.reduce((prev, cell, y, src) => {
      const x = src.length - 1 - rowIndex;
      prev[y] = prev[y] || [];
      prev[y][x] = cell;
      return prev;
    }, acc);
  }, []);
};

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const getGrid = () =>
    input.split("\n").map((row, y) => {
      return row
        .split("")
        .map((cell, x) => ({ cell, x, y }));
    });

  type Cell = ReturnType<typeof getGrid>[number][number];

  function tilt(map: Cell[][]) {
    let mut = 0;

    while (true) {
      map.forEach((row, y) => {
        if (y === 0) return;

        row.forEach((cell, x) => {
          if (cell.cell !== "O") return;

          let step = 1;
          const above = map[y - step][x];

          while (true) {
            if (above.cell !== ".") return;

            map[y - 1][x].cell = "O";
            map[y][x].cell = ".";

            mut++;
            step++;
          }
        });
      });

      if (mut === 0) break;
      mut = 0;
    }

    return map;
  }

  const pretty = (grid: Cell[][]) =>
    grid
      .map((row) => row.map((cell) => cell.cell).join(""))
      .join("\n");

  const grid = getGrid();
  const load = tilt(grid)
    .flat()
    .filter(({ cell }) => cell === "O")
    .map(({ y }) => grid.length - y)
    .reduce(sum);

  console.log("Part 1:", load);

  /**
   * Part Two
   */

  const doCycle = (grid: Cell[][]) => {
    for (const _ of ["N", "W", "S", "E"]) {
      grid = rotateCW(tilt(grid));
    }
  };

  const nGrid = getGrid();
  const seen = new Map();
  const cacheHits = [];
  let cycle = 1;

  while (true) {
    doCycle(nGrid);

    const key = pretty(nGrid);

    if (seen.has(key)) {
      cacheHits.push(cycle - seen.get(key));

      // ensure we have a pretty good run of repetition
      if (
        cacheHits.length === 10 &&
        new Set(cacheHits.slice(-10)).size === 1
      ) {
        break;
      }
    }

    seen.set(key, [cycle]);

    cycle++;
  }

  const period = cacheHits.at(-1);
  if (period == null) throw new Error("Typescript stuff");

  const leftOverCycles = (1_000_000_000 - cycle) % period;

  for (let i = 0; i < leftOverCycles; i++) {
    doCycle(nGrid);
  }

  const reload = nGrid
    .flat()
    .filter(({ cell }) => cell === "O")
    .map(({ y }) => grid.length - y)
    .reduce(sum);

  console.log("Part 2:", reload);
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
