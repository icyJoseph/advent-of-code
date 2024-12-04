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

  const lines = input.split("\n").map((row) => row.split(""));

  const height = lines.length;
  const width = lines[0].length;

  const XMAS = "XMAS";

  function countXMAS(row: string[]) {
    return row.reduce((acc, curr, index, src) => {
      switch (curr) {
        case "X":
        case "S": {
          const word = src.slice(index, index + XMAS.length);

          if (curr === "S") word.reverse();

          // i +1 +2 +3
          // X M  A  S
          return word.join("") === XMAS ? acc + 1 : acc;
        }

        default:
          return acc;
      }
    }, 0);
  }

  const rotated0 = lines.map(countXMAS).reduce(sum);

  const rotated45 = rot45(rotateCCW(lines)).map(countXMAS).reduce(sum);

  const rotated90 = rotateCW(lines).map(countXMAS).reduce(sum);

  const rotated225 = rot45(rotateCW(rotateCW(lines)))
    .map(countXMAS)
    .reduce(sum);

  console.log("Part 1:", rotated0 + rotated45 + rotated90 + rotated225);

  /**
   * Part Two
   */
  const adj = calcAdj(width, height);

  const diagSet = new Set(["MAS", "SAM"]);

  const p2 = lines.reduce((total, row, y) => {
    return (
      total +
      row.reduce((acc, curr, x) => {
        if (curr !== "A") return acc;

        // top-left, ..., ..., bottom-right
        const [tl, tr, bl, br] = adj[y][x].map(([x0, y0]) => lines[y0][x0]);

        const correctFirstDiag = diagSet.has(tl + curr + br);
        const correctSecondDiag = diagSet.has(bl + curr + tr);

        return correctFirstDiag && correctSecondDiag ? acc + 1 : acc;
      }, 0)
    );
  }, 0);

  console.log("Part 2:", p2);
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

function rot45<T>(grid: T[][]) {
  const height = grid.length;
  const width = grid[0].length;
  const diagonals = width + height - 1;

  const edges = [];
  let x = 0;
  let y = 0;

  for (let diag = 0; diag < diagonals; diag++) {
    edges.push([x, y]);

    if (y < height - 1) {
      y = y + 1;
    } else {
      x = x + 1;
    }
  }

  const result: T[][] = [];

  edges.forEach(([x0, y0]) => {
    const row: T[] = [];
    let x = x0;
    let y = y0;
    while (true) {
      const item = grid[y]?.[x];

      if (typeof item === "undefined") break;

      row.push(item);

      x = x + 1;
      y = y - 1;
    }

    result.push(row);
  });

  return result;
}

function rotateCW<T>(grid: T[][]) {
  return grid.reduce<T[][]>((acc, row, rowIndex) => {
    return row.reduce((prev, cell, y, src) => {
      const x = src.length - 1 - rowIndex;
      prev[y] = prev[y] || [];
      prev[y][x] = cell;
      return prev;
    }, acc);
  }, []);
}

function rotateCCW<T>(grid: T[][]) {
  return grid.reduce<T[][]>((acc, row, x) => {
    return row.reduce((prev, cell, colIndex, src) => {
      const y = src.length - 1 - colIndex;
      prev[y] = prev[y] || [];
      prev[y][x] = cell;
      return prev;
    }, acc);
  }, []);
}

function calcAdj(width: number, height: number): number[][][][] {
  const adj: number[][][][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => [])
  );

  // dx,dy
  const deltas = [
    [-1, -1], //tl
    [1, -1], //tr
    [-1, 1], //bl
    [1, 1], //br
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      deltas.forEach(([dx, dy]) => {
        const x1 = x + dx;
        const y1 = y + dy;

        if (0 <= x1 && x1 < width && 0 <= y1 && y1 < height) {
          adj[y][x].push([x1, y1]);
        }
      });
    }
  }

  return adj;
}
