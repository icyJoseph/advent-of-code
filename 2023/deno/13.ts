const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

const transpose = <T>(arr: T[][]) =>
  arr[0].map((_, colIndex) =>
    arr.map((row) => row[colIndex])
  );

function mirrorFinder(
  grid: string[][],
  coord: number,
  skip?: number
) {
  if (coord === skip) return false;

  let d = 0;
  while (true) {
    const above = grid[coord - d];
    const below = grid[coord + d + 1];
    if (above != null && below != null) {
      if (above.join("") === below.join("")) {
        d++;
        continue;
      }
      return false;
    }

    return true;
  }
}

function getReflections(
  grid: string[][],
  skipRow?: number | undefined,
  skipCol?: number | undefined
): { row?: number; col?: number } {
  const rowCandidates = grid
    .map((row, y) => [row, y] as const)
    .filter(
      ([row], i, src) =>
        row.join("") === src[i + 1]?.[0]?.join("")
    )
    .map(([, index]) => index);

  const row = rowCandidates.find((y) =>
    mirrorFinder(grid, y, skipRow)
  );

  const rotated = transpose(grid);

  const colCandidates = rotated
    .map((row, xC) => [row, xC] as const)
    .filter(
      ([row], i, src) =>
        row.join("") === src[i + 1]?.[0]?.join("")
    )
    .map(([, index]) => index);

  const col = colCandidates.find((x) =>
    mirrorFinder(rotated, x, skipCol)
  );

  return { row, col };
}

const sumReflections = (
  acc: number,
  { col = -1, row = -1 }
) => {
  return acc + col + 1 + 100 * (row + 1);
};

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const map = input.split("\n\n").map((pattern) => {
    return pattern.split("\n").map((row) => row.split(""));
  });

  const reflections = map.map((grid) => {
    return getReflections(grid);
  });

  console.log(
    "Part 1:",
    reflections.reduce(sumReflections, 0)
  );

  /**
   * Part Two
   */

  const newReflections = map.map((pattern) => {
    const original = getReflections(pattern);
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

        if (next.col == null && next.row == null) continue;

        return next;
      }
    }

    return original;
  });

  // 24678 wrong
  // 24684 wrong
  // 40264 wrong
  // 38219 wrong
  // 31830 wrong
  // 31836 right!
  console.log(
    "Part 2:",
    newReflections.reduce(sumReflections, 0)
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
