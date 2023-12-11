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

const rotateCCW = <T>(grid: T[][]) => {
  return grid.reduce<T[][]>((acc, row, x) => {
    return row.reduce((prev, cell, colIndex, src) => {
      const y = src.length - 1 - colIndex;
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

  const universe = input.split("\n").map((row, y) => {
    return row.split("").map((value, x, src) => ({
      x,
      y,
      value,
      id: y * (src.length - 1) + x, // y * width + x
    }));
  });

  type Entry = {
    y: number;
    x: number;
    value: string;
    id: number;
  };

  const calcDist = (
    lhs: Entry,
    rhs: Entry,
    rowGaps: number[],
    colGaps: number[],
    leap: number
  ) => {
    const [cLb, cUb] = [
      Math.min(lhs.x, rhs.x),
      Math.max(lhs.x, rhs.x),
    ];
    const [rLb, rUb] = [
      Math.min(lhs.y, rhs.y),
      Math.max(lhs.y, rhs.y),
    ];

    const rowLeaps = rowGaps.filter(
      (y) => rLb < y && y < rUb
    ).length;
    const colLeaps = colGaps.filter(
      (x) => cLb < x && x < cUb
    ).length;

    const rowDist =
      Math.abs(lhs.y - rhs.y) - rowLeaps + rowLeaps * leap;

    const colDist =
      Math.abs(lhs.x - rhs.x) - colLeaps + colLeaps * leap;

    return rowDist + colDist;
  };

  function calcShortestPaths(
    leap: number
  ): Map<string, number> {
    const rowCrossings = universe.reduce<number[]>(
      (acc, row, y) => {
        const shouldExpand = row.every(
          ({ value }) => value === "."
        );
        if (shouldExpand) acc.push(y);

        return acc;
      },
      []
    );

    const colCrossings = rotateCCW(universe).reduce<
      number[]
    >((acc, col, x, src) => {
      const shouldExpand = col.every(
        ({ value }) => value === "."
      );

      if (shouldExpand) acc.push(src.length - x - 1);

      return acc;
    }, []);

    const galaxies: Entry[] = [];

    universe.forEach((row) => {
      row.forEach((cell) => {
        if (cell.value === "#") galaxies.push(cell);
      });
    });

    const paths = galaxies.reduce<
      Map<
        string | number,
        Array<{ key: string; dist: number }>
      >
    >((acc, curr, _, src) => {
      acc.set(
        curr.id,
        src
          .filter((other) => other !== curr)
          .map((other) => ({
            dist: calcDist(
              curr,
              other,
              rowCrossings,
              colCrossings,
              leap
            ),
            key: `${Math.min(
              curr.id,
              other.id
            )}->${Math.max(curr.id, other.id)}`,
          }))
      );

      return acc;
    }, new Map());

    return [...paths.values()].reduce<Map<string, number>>(
      (acc, row) => {
        row.forEach((curr) => {
          acc.set(curr.key, curr.dist);
        });
        return acc;
      },
      new Map()
    );
  }

  console.log(
    "Part 1:",
    [...calcShortestPaths(2).values()].reduce(sum)
  );

  console.log(
    "Part 2:",
    [
      ...calcShortestPaths(
        isExample ? 10 : 1_000_000
      ).values(),
    ].reduce(sum)
  );
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
