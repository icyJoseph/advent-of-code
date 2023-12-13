const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

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

  const map = input.split("\n\n").map((pattern) => {
    const grid = pattern
      .split("\n")
      .map((row) => row.split(""));
    return {
      grid,
      rotated: rotateCW(grid),
    };
  });

  const reflections = map.map(({ grid, rotated }) => {
    const rowCandidates = grid
      .map((row, y) => [row, y] as const)
      .filter(
        ([row], i, src) =>
          row.join("") === src[i + 1]?.[0]?.join("")
      )
      .map(([, index]) => index);

    const colCandidates = rotated
      .map((row, xC) => [row, xC] as const)
      .filter(
        ([row], i, src) =>
          row.join("") === src[i + 1]?.[0]?.join("")
      )
      .map(([, index]) => index);

    const row = rowCandidates.find((y) => {
      let d = 0;
      while (true) {
        const above = grid[y - d];
        const below = grid[y + d + 1];
        if (
          typeof above !== "undefined" &&
          typeof below !== "undefined"
        ) {
          if (above.join("") === below.join("")) {
            d++;
            continue;
          }
          return false;
        }

        return true;
      }
    });

    if (typeof row === "number") return { row };

    const col = colCandidates.find((y) => {
      let d = 0;
      while (true) {
        const above = rotated[y - d];
        const below = rotated[y + d + 1];
        if (
          typeof above !== "undefined" &&
          typeof below !== "undefined"
        ) {
          if (above.join("") === below.join("")) {
            d++;
            continue;
          }
          return false;
        }

        return true;
      }
    });

    return { col };
  });

  const summary = reflections.reduce(
    (acc, { col = -1, row = -1 }) => {
      return acc + (col + 1) + 100 * (row + 1);
    },
    0
  );

  console.log("Part 1:", summary);

  /**
   * Part Two
   */
  function getReflections(
    pattern: string[][],
    skipRow?: number | undefined,
    skipCol?: number | undefined
  ): { row?: number; col?: number } {
    const grid = pattern;

    const rotated = rotateCW(grid);

    const rowCandidates = grid
      .map((row, y) => [row, y] as const)
      .filter(
        ([row], i, src) =>
          row.join("") === src[i + 1]?.[0]?.join("")
      )
      .map(([, index]) => index);

    const colCandidates = rotated
      .map((row, xC) => [row, xC] as const)
      .filter(
        ([row], i, src) =>
          row.join("") === src[i + 1]?.[0]?.join("")
      )
      .map(([, index]) => index);

    const row = rowCandidates.find((y) => {
      if (y === skipRow) return false;
      let d = 0;
      while (true) {
        const above = grid[y - d];
        const below = grid[y + d + 1];
        if (
          typeof above !== "undefined" &&
          typeof below !== "undefined"
        ) {
          if (above.join("") === below.join("")) {
            d++;
            continue;
          }
          return false;
        }

        return true;
      }
    });

    if (typeof row === "number") return { row };

    const col = colCandidates.find((y) => {
      if (y === skipCol) return false;
      let d = 0;
      while (true) {
        const above = rotated[y - d];
        const below = rotated[y + d + 1];
        if (
          typeof above !== "undefined" &&
          typeof below !== "undefined"
        ) {
          if (above.join("") === below.join("")) {
            d++;
            continue;
          }
          return false;
        }

        return true;
      }
    });

    return { col };
  }

  const newMap = input
    .split("\n\n")
    .map((pattern) =>
      pattern.split("\n").map((row) => row.split(""))
    )
    .map((pattern) => {
      const original = getReflections(pattern);
      // const key = `${
      //   original.col != null ? `col:${original.col}` : " "
      // } ${
      //   original.row != null ? `row:${original.row}` : " "
      // }`
      //   .trim()
      //   .split(" ")[0];
      // const key = JSON.stringify(original);
      // console.log({ original, key });
      // console.log(
      //   pattern.map((row) => row.join("")).join("\n")
      // );

      // const seen = new Set<string>();

      for (const y in pattern) {
        const row = pattern[y];

        for (const x in row) {
          const cell = row[x];

          const mut = cell === "#" ? "." : "#";

          const mutPat = pattern.map((row) => [...row]);
          mutPat[y][x] = mut;

          const next = getReflections(
            mutPat,
            original.row,
            original.col
          );
          if (next.col == null && next.row == null)
            continue;

          // console.log({ original, next });
          return next;

          // if (JSON.stringify(next) !== key) {
          //   console.log({ next, original });
          //   result = JSON.stringify(next);
          // }

          // const nextKey = `${
          //   next.col != null ? `col:${next.col}` : " "
          // } ${
          //   next.row != null ? `row:${next.row}` : " "
          // }`.trim();

          // if (!nextKey) return;

          // console.log({ nextKey, x, y });
          // nextKey.split(" ").forEach((c) => seen.add(c));
        }
      }
      // console.log(result, index);

      // if (original.row == null) {
      //   return original;
      // }
      // return { col: original.col };

      return original;

      // const [diff] = [...seen.values()].filter(
      //   (s) => !key.includes(s)
      // );
      // // console.log({ diff });
      // if (diff == null) {
      //   // console.log({ original, key }, "\n");
      //   return original;
      // }

      // const result: {
      //   row: number | undefined;
      //   col: number | undefined;
      // } = {
      //   row:
      //     diff != null
      //       ? Number(diff.replace("row:", ""))
      //       : undefined,
      //   col:
      //     diff != null
      //       ? Number(diff.replace("col:", ""))
      //       : undefined,
      // };
      // if (
      //   typeof result.row === "number" &&
      //   isNaN(result.row)
      // ) {
      //   result.row = undefined;
      // }
      // if (
      //   typeof result.col === "number" &&
      //   isNaN(result.col)
      // ) {
      //   result.col = undefined;
      // }
      // // console.log({ result, original, key }, "\n");
      // return result;
    });

  const summary2 = newMap.reduce(
    (acc, { col = -1, row = -1 }) => {
      return acc + col + 1 + 100 * (row + 1);
    },
    0
  );

  // 24678 wrong
  // 24684 wrong
  // 40264 wrong
  // 38219 wrong
  // 31830 wrong
  // 31836 right!
  console.log("Part 2:", summary2);
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
