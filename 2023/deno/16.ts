const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const grid = input.split("\n").map((row, y) => {
    return row.split("");
  });

  type Dir = "U" | "D" | "R" | "L";
  type Beam = {
    x: number;
    y: number;
    heading: Dir;
  };

  function moveBeam(beam: {
    x: number;
    y: number;
    heading: Dir;
  }): Beam {
    switch (beam.heading) {
      case "U":
        return { ...beam, y: beam.y - 1 };
      case "D":
        return { ...beam, y: beam.y + 1 };
      case "R":
        return { ...beam, x: beam.x + 1 };
      case "L":
        return { ...beam, x: beam.x - 1 };
      default:
        throw new Error(beam.heading);
    }
  }
  const dirs: Record<Dir, Dir> = {
    L: "L",
    D: "D",
    R: "R",
    U: "U",
  };

  function reflect(map: string[][], start: Beam) {
    const height = map.length;
    const width = map[0].length;
    let beams: Beam[] = [{ ...start }];

    const energized = new Set();
    energized.add(`${start.x}::${start.y}`);

    const seen = new Set();

    while (beams.length > 0) {
      beams = beams
        .flatMap((beam) => {
          const cell = map[beam.y][beam.x];

          switch (cell) {
            case ".":
              break;
            case "/":
              switch (beam.heading) {
                case "U":
                  beam.heading = "R";
                  break;
                case "D":
                  beam.heading = "L";
                  break;
                case "R":
                  beam.heading = "U";
                  break;
                case "L":
                  beam.heading = "D";
                  break;
              }
              break;
            case "\\":
              switch (beam.heading) {
                case "U":
                  beam.heading = "L";
                  break;
                case "D":
                  beam.heading = "R";
                  break;
                case "R":
                  beam.heading = "D";
                  break;
                case "L":
                  beam.heading = "U";
                  break;
              }
              break;
            case "-":
              switch (beam.heading) {
                case "U":
                case "D":
                  return [
                    { ...beam, heading: dirs.L },
                    { ...beam, heading: dirs.R },
                  ].map(moveBeam);

                case "R":
                case "L":
                  break;
              }
              break;
            case "|":
              switch (beam.heading) {
                case "L":
                case "R":
                  return [
                    { ...beam, heading: dirs.U },
                    { ...beam, heading: dirs.D },
                  ].map(moveBeam);

                case "U":
                case "D":
                  break;
              }
              break;
          }

          return moveBeam(beam);
        })
        .filter((beam) => {
          if (beam.x < 0 || beam.x >= width) return false;
          if (beam.y < 0 || beam.y >= height) return false;

          const key = `${beam.x}::${beam.y}::${beam.heading}`;
          return !seen.has(key);
        });

      beams.forEach((beam) => {
        const key = `${beam.x}::${beam.y}`;

        energized.add(key);

        seen.add(`${key}::${beam.heading}`);
      });
    }

    return energized.size;
  }

  const p1 = reflect(grid, { x: 0, y: 0, heading: "R" });

  console.log("Part 1:", p1);

  const width = grid[0].length;
  const height = grid.length;

  let max = -Infinity;

  for (let x = 0; x < width; x++) {
    max = Math.max(
      max,
      reflect(grid, { x, y: 0, heading: "D" })
    );
    max = Math.max(
      max,
      reflect(grid, { x, y: height - 1, heading: "U" })
    );
  }

  for (let y = 0; y < height; y++) {
    max = Math.max(
      max,
      reflect(grid, { y, x: 0, heading: "R" })
    );
    max = Math.max(
      max,
      reflect(grid, { y, x: width - 1, heading: "L" })
    );
  }

  console.log("Part 2:", max);

  /**
   * Part Two
   */
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
