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

const wrap = (a: number, b: number): number => (a > 0 ? a % b : (b + a) % b);

type Coord = { x: number; y: number };

type Dirs = {
  top?: Coord;
  right?: Coord;
  bottom?: Coord;
  left?: Coord;
};

function calcAdj(width: number, height: number, grid: string[][]) {
  const adj: Dirs[][] = Array.from({ length: height }, () => {
    return Array.from({ length: width }, () => ({}));
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

        while (true) {
          // move in a given direction until something is hit
          // even wrapping around the map
          // grid[y][x] = cell
          const x1 = wrap(x + step * dx, width);
          const y1 = wrap(y + step * dy, height);

          // no checks for bounds are needed because we are
          // wrapping around the map

          const cell = grid[y1][x1];

          if (cell === "#") {
            // do not expand this direction
            break;
          }

          if (cell === ".") {
            // usable cell

            const coord = { x: x1, y: y1 };

            if (dx === 0) {
              if (dy === -1) {
                // up
                adj[y][x].top = coord;
              }
              if (dy === 1) {
                // down
                adj[y][x].bottom = coord;
              }
            }

            if (dy === 0) {
              if (dx === -1) {
                // left
                adj[y][x].left = coord;
              }
              if (dx === 1) {
                // right
                adj[y][x].right = coord;
              }
            }

            break;
          }

          if (cell === " ") {
            step += 1;
          }
        }
      });
    }
  }

  return adj;
}

const nextDir = (dir: string, inst: string) => {
  // R clockwise
  switch (dir) {
    case ">":
      return inst === "R" ? "v" : "^";
    case "v":
      return inst === "R" ? "<" : ">";
    case "<":
      return inst === "R" ? "^" : "v";
    case "^":
      return inst === "R" ? ">" : "<";
    default:
      throw new Error(dir);
  }
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
    .split(`${token}`);

  const width = Math.max(...grid.map((row) => row.length));
  const height = grid.length;

  grid.forEach((row, y) => {
    grid[y] = row.join("").padEnd(width, " ").split("");
  });
  const adj = calcAdj(width, height, grid);

  const y0 = 0;
  const x0 = grid[y0].findIndex((cell) => cell === ".");

  const path = Array.from({ length: height }, (_, y) => {
    return Array.from({ length: width }, (_, x) => grid[y][x] || " ");
  });

  let currentDir = ">";

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
      let steps = Number(inst);

      while (steps--) {
        const { x, y } = currentCoord;

        if (currentDir === ">") {
          currentCoord = adj[y][x].right ?? currentCoord;
        }

        if (currentDir === "v") {
          currentCoord = adj[y][x].bottom ?? currentCoord;
        }

        if (currentDir === "<") {
          currentCoord = adj[y][x].left ?? currentCoord;
        }

        if (currentDir === "^") {
          currentCoord = adj[y][x].top ?? currentCoord;
        }

        path[currentCoord.y][currentCoord.x] = currentDir;
      }
    }
  }

  const faceScore = (dir: string) => {
    switch (dir) {
      case ">":
        return 0;
      case "v":
        return 1;
      case "<":
        return 2;
      case "^":
        return 3;
      default:
        throw new Error("Invalid direction");
    }
  };

  const score = ({ x, y }: Coord, dir: string) => {
    const facing = faceScore(dir);

    const row = y + 1;
    const col = x + 1;

    return 1000 * row + 4 * col + facing;
  };

  /**
   * Part One
   */
  console.log("Part one:", score(currentCoord, currentDir));

  /**
   * Part Two
   */

  const walkCube = () => {
    const size = 50;

    const sections: Record<string, string[][]> = {};

    chunks(grid, size).forEach((subGrid, x) => {
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
    };

    const y0 = 0;
    const x0 = grid[y0].findIndex((cell) => cell === ".");

    const path = Array.from({ length: height }, (_, y) => {
      return Array.from({ length: width }, (_, x) => grid[y][x] || " ");
    });

    let currentDir = ">";

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
        let steps = Number(inst);

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

          // transform to 50-offset-based
          const asOffset = (n: number) => n % size;

          const next = { x: asOffset(x) + dx, y: asOffset(y) + dy };

          // assume it stays within the face
          flatCubeCoord = { x: x + dx, y: y + dy }; // otherwise it'll be modified

          // Direction changes when switching cubes
          let newDir = currentDir;

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
    console.log("Part two:", score(flatCubeCoord, currentDir));
  };

  walkCube();
};

// await solve(true);
console.log("---");
await solve();
