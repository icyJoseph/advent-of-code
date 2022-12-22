const [__filename_ext] = new URL("", import.meta.url).pathname
  .split("/")
  .slice(-1);
const filename = __filename_ext.replace(".ts", "");

// rotates counter clockwise
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

// good ol' [1,2,3,4] into [[1,2],[3,4]]
const chunks = <T>(arr: T[], size: number) =>
  arr.reduce<T[][]>((acc, row) => {
    const last = acc.pop();

    if (!last) return size > 0 ? [[row]] : [[]];

    acc.push(last);

    if (last.length < size) {
      last.push(row);
    } else {
      size > 0 ? acc.push([row]) : acc.push([]);
    }

    return acc;
  }, []);

const rem = (a: number, b: number): number => (a > 0 ? a % b : (b + a) % b);

type Coord = { x: number; y: number };

type Directions = "top" | "bottom" | "right" | "left";

type Dirs = Partial<Record<Directions, Coord>>;

type Heading = ">" | "v" | "<" | "^";

type Rotation = "R" | "L";

// const getDirection = (dx: number, dy: number): Directions => {
//   switch (`${dx}.${dy}`) {
//     case "-1.0":
//       return "left";
//     case "1.0":
//       return "right";
//     case "0.-1":
//       return "top";
//     case "0.1":
//       return "bottom";
//     default:
//       throw new Error("Invalid direction");
//   }
// };
const getDirection = (dx: number, dy: number): Directions => {
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  switch (angle) {
    case 0:
      return "right";
    case 90:
      // inverted Y axis
      return "bottom";
    case 180:
      return "left";
    case -90:
      // inverted Y axis
      return "top";
    default:
      throw new Error("Invalid direction:" + angle);
  }
};

const directions: Readonly<Directions[]> = Object.freeze([
  "right",
  "bottom",
  "left",
  "top",
]);

const getDirectionFromHeading = (heading: Heading): Directions => {
  return directions[headings.indexOf(heading)];
};

function calcAdj(width: number, height: number, grid: string[][]) {
  const adj = Array.from({ length: height }, () => {
    return Array.from({ length: width }, () => ({} as Dirs));
  });
  const dirs = [0, 1, -1];

  // generate unit vector permutations for 2d
  const deltas = dirs
    .flatMap((x) => dirs.map((y) => [x, y]))
    // remove diagonals
    .filter(([x, y]) => Math.abs(x) + Math.abs(y) === 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] !== ".") continue;

      deltas.forEach(([dx, dy]) => {
        let step = 1;

        while (step) {
          // move in a given direction until something is hit
          // even wrapping around the map
          // grid[y][x] = cell
          const x1 = rem(x + step * dx, width);
          const y1 = rem(y + step * dy, height);

          // no checks for bounds are needed because we are
          // wrapping around the map
          switch (grid[y1][x1]) {
            case "#":
              step = 0;
              // do not expand this direction
              break;
            case ".": {
              const direction = getDirection(dx, dy);
              adj[y][x][direction] = { x: x1, y: y1 };
              step = 0;
              break;
            }
            case " ": {
              // grow the delta vector
              step += 1;
              break;
            }
            default:
              throw new Error("Invalid cell");
          }
        }
      });
    }
  }

  return adj;
}

const headings: Readonly<Heading[]> = Object.freeze([">", "v", "<", "^"]);

const facingScore = (heading: Heading) => {
  return headings.indexOf(heading);
};

const score = ({ x, y }: Coord, dir: Heading) => {
  return 1000 * (y + 1) + 4 * (x + 1) + facingScore(dir);
};

const nextDir = (dir: Heading, rot: Rotation) => {
  const current = headings.indexOf(dir);
  const delta = rot === "R" ? 1 : -1;
  const next = rem(current + delta, headings.length);

  return headings[next];
};

const solve = async (example = false) => {
  const input = await Deno.readTextFile(
    `./input/${example ? "example" : filename}.in`
  );

  if (example) {
    console.log("Example", filename);
  }

  const data = input.split("\n\n");

  const [gridStr, movesStr] = data;

  const grid = gridStr.split("\n").map((row) => row.split(""));

  const token = "::";
  const moves = movesStr
    .replaceAll(/(R|L)/g, (m) => `${token}${m}${token}`)
    .split(`${token}`)
    .map((mv) => (mv === "R" || mv === "L" ? mv : Number(mv)));

  const width = Math.max(...grid.map((row) => row.length));
  const height = grid.length;

  grid.forEach((row, y) => {
    grid[y] = row.join("").padEnd(width, " ").split("");
  });

  const walkPlane = (graph: string[][]) => {
    const adj = calcAdj(width, height, graph);

    const y0 = 0;
    const x0 = graph[y0].findIndex((cell) => cell === ".");

    const path = Array.from({ length: height }, (_, y) => {
      return Array.from({ length: width }, (_, x) => graph[y][x] || " ");
    });

    let currentDir: Heading = ">";

    let currentCoord = { y: y0, x: x0 };
    path[y0][x0] = currentDir;

    for (const inst of moves) {
      if (inst === "R" || inst === "L") {
        const { x, y } = currentCoord;
        // direction change
        currentDir = nextDir(currentDir, inst);
        path[y][x] = currentDir;
        // no coord change
      } else {
        let steps = inst;

        while (steps--) {
          const { x, y } = currentCoord;

          const direction = getDirectionFromHeading(currentDir);

          const next = adj[y][x][direction];

          // there's no where to go
          if (typeof next === "undefined") break;

          currentCoord = next;

          path[currentCoord.y][currentCoord.x] = currentDir;
        }
      }
    }

    return score(currentCoord, currentDir);
  };

  /**
   * Part One
   */
  console.log("Part one:", walkPlane(grid));

  /**
   * Part Two
   */

  const walkCube = (graph: string[][], size: number) => {
    // Divide the grid into regions of size x size
    // each of these regions is a face
    const sections: Record<string, string[][]> = {};

    chunks(graph, size).forEach((subGrid, x) => {
      const chunkedRows = subGrid.map((row) => chunks(row, size));

      chunkedRows.forEach((chunk) =>
        chunk.forEach((row, y) => {
          const key = `${x}.${y}`;
          sections[key] = sections[key] || [];
          sections[key].push(row);
        })
      );
    });

    type Cell = { cell: string; origin: Coord; relative: Coord };

    const faces = Object.entries(sections)
      .filter(([, value]) =>
        value
          .map((row) => row.join(""))
          .join("")
          .trim()
      )
      .reduce<Record<string, Cell[][]>>((prev, [key, value]) => {
        prev[key] = value.map<Cell[]>((row, dy) =>
          row.map<Cell>((cell, dx) => {
            const [y, x] = key.split(".").map(Number);

            const origin = { x: size * x, y: y * size };

            return {
              cell,
              origin,
              relative: { x: dx, y: dy },
            };
          })
        );
        return prev;
      }, {});

    // TODO: Make this generic so that it
    // can work with example and any input
    const cubeAdj = {
      "0.1": {
        top: { face: rotateCCW(faces["3.0"]), dir: ">" },
        right: { face: faces["0.2"], dir: ">" },
        bottom: { face: faces["1.1"], dir: "v" },
        left: { face: rotateCCW(rotateCCW(faces["2.0"])), dir: ">" },
      },
      "0.2": {
        top: { face: faces["3.0"], dir: "^" },
        right: { face: rotateCCW(rotateCCW(faces["2.1"])), dir: "<" },
        bottom: { face: rotateCCW(faces["1.1"]), dir: "<" },
        left: { face: faces["0.1"], dir: "<" },
      },
      "1.1": {
        top: { face: faces["0.1"], dir: "^" },
        right: {
          face: rotateCCW(rotateCCW(rotateCCW(faces["0.2"]))),
          dir: "^",
        },
        bottom: { face: faces["2.1"], dir: "v" },
        left: { face: rotateCCW(rotateCCW(rotateCCW(faces["2.0"]))), dir: "v" },
      },
      "2.0": {
        top: { face: rotateCCW(faces["1.1"]), dir: ">" },
        right: { face: faces["2.1"], dir: ">" },
        bottom: { face: faces["3.0"], dir: "v" },
        left: { face: rotateCCW(rotateCCW(faces["0.1"])), dir: ">" },
      },
      "2.1": {
        top: { face: faces["1.1"], dir: "^" },
        right: { face: rotateCCW(rotateCCW(faces["0.2"])), dir: "<" },
        bottom: { face: rotateCCW(faces["3.0"]), dir: "<" },
        left: { face: faces["2.0"], dir: "<" },
      },
      "3.0": {
        top: { face: faces["2.0"], dir: "^" },
        right: {
          face: rotateCCW(rotateCCW(rotateCCW(faces["2.1"]))),
          dir: "^",
        },
        bottom: { face: faces["0.2"], dir: "v" },
        left: { face: rotateCCW(rotateCCW(rotateCCW(faces["0.1"]))), dir: "v" },
      },
    } as const;

    const y0 = 0;
    const x0 = graph[y0].findIndex((cell) => cell === ".");

    const path = Array.from({ length: height }, (_, y) => {
      return Array.from({ length: width }, (_, x) => graph[y][x] || " ");
    });

    let currentDir: Heading = ">";

    // flat coordinate
    let flatCubeCoord = { y: y0, x: x0 };
    path[y0][x0] = currentDir;

    for (const inst of moves) {
      if (inst === "R" || inst === "L") {
        // direction change
        const { x, y } = flatCubeCoord;
        // direction change
        currentDir = nextDir(currentDir, inst);
        path[y][x] = currentDir;
      } else {
        let steps = inst;

        while (steps--) {
          const { x, y } = flatCubeCoord;
          // move through the cube faces
          const faceKey = `${Math.floor(y / size)}.${Math.floor(
            x / size
          )}` as keyof typeof cubeAdj;

          // face adjacency in case of going under 0 or over 50
          const faceAdj = cubeAdj[faceKey];

          if (typeof faceAdj === "undefined")
            throw new Error("Invalid key: " + faceKey);

          let dx = 0;
          let dy = 0;

          if (currentDir === ">") {
            dx = 1;
          }

          if (currentDir === "v") {
            dy = 1;
          }

          if (currentDir === "<") {
            dx = -1;
          }

          if (currentDir === "^") {
            dy = -1;
          }

          // transform to <size>-offset-based
          const next = { x: (x % size) + dx, y: (y % size) + dy };

          // assume it stays within the face
          flatCubeCoord = { x: x + dx, y: y + dy };

          // Direction changes when switching cubes
          let newDir: Heading = currentDir;

          if (next.x < 0) {
            const left = faceAdj.left.face;
            const fx = size + next.x;
            const fy = next.y;

            const facePosition = left[fy][fx];
            const realX = facePosition.origin.x + facePosition.relative.x;
            const realY = facePosition.origin.y + facePosition.relative.y;

            flatCubeCoord = { x: realX, y: realY };
            newDir = faceAdj.left.dir;
          }
          if (next.x >= size) {
            const right = faceAdj.right.face;

            const fx = next.x - size;
            const fy = next.y;

            const facePosition = right[fy][fx];
            const realX = facePosition.origin.x + facePosition.relative.x;
            const realY = facePosition.origin.y + facePosition.relative.y;

            flatCubeCoord = { x: realX, y: realY };
            newDir = faceAdj.right.dir;
          }
          if (next.y < 0) {
            const top = faceAdj.top.face;

            const fx = next.x;
            const fy = size + next.y;

            const facePosition = top[fy][fx];
            const realX = facePosition.origin.x + facePosition.relative.x;
            const realY = facePosition.origin.y + facePosition.relative.y;

            flatCubeCoord = { x: realX, y: realY };
            newDir = faceAdj.top.dir;
          }
          if (next.y >= size) {
            const bottom = faceAdj.bottom.face;

            const fx = next.x;
            const fy = next.y - size;

            const facePosition = bottom[fy][fx];
            const realX = facePosition.origin.x + facePosition.relative.x;
            const realY = facePosition.origin.y + facePosition.relative.y;

            flatCubeCoord = { x: realX, y: realY };
            newDir = faceAdj.bottom.dir;
          }

          if (path[flatCubeCoord.y][flatCubeCoord.x] === " ") {
            throw new Error("Empty space hit");
          }

          if (path[flatCubeCoord.y][flatCubeCoord.x] !== "#") {
            currentDir = newDir;
            path[flatCubeCoord.y][flatCubeCoord.x] = currentDir;
          } else {
            // stay where we were, because moving hits a wall
            flatCubeCoord = { x, y };
            // we could break out here as well
          }
        }
      }
    }

    // 28492 too low
    // 70232 too low
    // 135087 wrong
    // 140020 too high
    // 115311 right!
    return score(flatCubeCoord, currentDir);
  };

  console.log("Part two:", walkCube(grid, 50));
};

// await solve(true);
console.log("---");
await solve();
