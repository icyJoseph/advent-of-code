const [__filename_ext] = new URL("", import.meta.url).pathname
  .split("/")
  .slice(-1);
const filename = __filename_ext.replace(".ts", "");

const createCubeModel = <Face>(
  // clockwise
  cw: (m: Face) => Face,
  // counter-clockwise
  ccw: (m: Face) => Face
) => {
  type Side = "top" | "front" | "bottom" | "back" | "left" | "right";

  const faces: Partial<Record<Side, Face>> = {};

  const rotateFwd = () => {
    const current = { ...faces };

    faces.top = current.back;
    faces.front = current.top;
    faces.bottom = current.front;
    faces.back = current.bottom;

    faces.right = current.right && cw(current.right);
    faces.left = current.left && ccw(current.left);
  };

  const rotateBwd = () => {
    const current = { ...faces };

    faces.top = current.front;
    faces.back = current.top;
    faces.bottom = current.back;
    faces.front = current.bottom;

    faces.right = current.right && ccw(current.right);
    faces.left = current.left && cw(current.left);
  };

  const rotateRight = () => {
    const current = { ...faces };

    faces.top = current.left;
    faces.right = current.top;
    faces.bottom = current.right;
    faces.left = current.bottom;

    faces.front = current.front && ccw(current.front);
    // faces.front = current.front && cw(current.front);
    faces.back = current.back && cw(current.back);
  };

  const rotateLeft = () => {
    const current = { ...faces };

    faces.top = current.right;
    faces.left = current.top;
    faces.bottom = current.left;
    faces.right = current.bottom;

    faces.front = current.front && cw(current.front);
    faces.back = current.back && ccw(current.back);
  };

  const yawRight = () => {
    const current = { ...faces };

    faces.back = current.left && cw(current.left);
    faces.right = current.back && cw(current.back);
    faces.front = current.right && cw(current.right);
    faces.left = current.front && cw(current.front);

    faces.top = current.top && ccw(current.top);
    faces.bottom = current.bottom && cw(current.bottom);
  };

  const yawLeft = () => {
    const current = { ...faces };

    faces.back = current.right && ccw(current.right);
    faces.left = current.back && ccw(current.back);
    faces.front = current.left && ccw(current.left);
    faces.right = current.front && ccw(current.front);

    faces.top = current.top && cw(current.top);
    faces.bottom = current.bottom && ccw(current.bottom);
  };

  return {
    get faces() {
      return { ...faces };
    },
    setFace(side: Side, value: Face) {
      faces[side] = value;
    },
    rotateFwd,
    rotateBwd,
    rotateLeft,
    rotateRight,
    yawLeft,
    yawRight,
  };
};

type CubeModel<Model> = ReturnType<typeof createCubeModel<Model>>;

type FaceAdj<T> = {
  key: string;
  value: T;
  top?: FaceAdj<T>;
  bottom?: FaceAdj<T>;
  left?: FaceAdj<T>;
  right?: FaceAdj<T>;
};

// takes a cube model
// takes a tree of the flat faces
// builds the cube in exactly 6 rounds
const buildCube = <Model>(
  cube: CubeModel<Model>,
  face: FaceAdj<Model>,
  debug?: (m: Model) => void,
  seen = new Set()
) => {
  debug?.(face.value);

  cube.setFace("bottom", face.value);
  seen.add(face);

  if (face.top && !seen.has(face.top)) {
    // roll up
    cube.rotateBwd();
    buildCube(cube, face.top, debug, seen);
    cube.rotateFwd();
  }

  if (face.bottom && !seen.has(face.bottom)) {
    // roll down
    cube.rotateFwd();
    buildCube(cube, face.bottom, debug, seen);
    cube.rotateBwd();
  }

  if (face.left && !seen.has(face.left)) {
    cube.rotateLeft();
    buildCube(cube, face.left, debug, seen);
    cube.rotateRight();
  }

  if (face.right && !seen.has(face.right)) {
    cube.rotateRight();
    buildCube(cube, face.right, debug, seen);
    cube.rotateLeft();
  }

  return cube;
};

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

const dirs = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const rem = (a: number, b: number): number => (a > 0 ? a % b : (b + a) % b);

type Coord = { x: number; y: number };

type Directions = "top" | "bottom" | "right" | "left";

type Dirs = Partial<Record<Directions, Coord>>;

type Heading = ">" | "v" | "<" | "^";

type Rotation = "R" | "L";

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

// -> clockwise
const headings: Readonly<Heading[]> = Object.freeze([">", "v", "<", "^"]);

const getDirectionFromHeading = (heading: Heading): Directions => {
  return directions[headings.indexOf(heading)];
};

const rotateHeading = (heading: Heading, steps: number): Heading => {
  const index = headings.indexOf(heading);
  const newIndex = rem(index - steps, headings.length);

  return headings[newIndex];
};

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

function calcAdj(width: number, height: number, grid: string[][]) {
  const adj = Array.from({ length: height }, () => {
    return Array.from({ length: width }, () => ({} as Dirs));
  });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] !== ".") continue;

      dirs.forEach(([dx, dy]) => {
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

const solve = async (pathname: string) => {
  const input = await Deno.readTextFile(pathname);

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

    type Cell = {
      cell: string;
      origin: Coord;
      relative: Coord;
    };

    type FaceCells = {
      key: string;
      cells: Cell[][];
      offset: number;
    };

    const faces = Object.entries(sections)
      .filter(([, value]) =>
        value
          .map((row) => row.join(""))
          .join("")
          .trim()
      )
      .reduce<Record<string, FaceCells>>((prev, [key, value]) => {
        const cubeFace: FaceCells = {
          key,
          offset: 0,
          cells: value.map<Cell[]>((row, dy) =>
            row.map<Cell>((cell, dx) => {
              const [y, x] = key.split(".").map(Number);

              const origin = { x: size * x, y: y * size };

              return {
                cell,
                origin,
                relative: { x: dx, y: dy },
              };
            })
          ),
        };

        prev[key] = cubeFace;
        return prev;
      }, {});

    const faceAdjs: FaceAdj<FaceCells>[] = Object.keys(faces).map((key) => ({
      key,
      value: faces[key],
    }));

    console.log("Faces:", Object.keys(faces));

    faceAdjs.forEach((fadj) => {
      const [y, x] = fadj.key.split(".").map(Number);

      dirs.forEach(([dy, dx]) => {
        const otherKey = `${y + dy}.${x + dx}`;
        const other = faces[otherKey];

        if (!other) return;

        const otherAdj = faceAdjs.find((ot) => ot.value === other);

        if (!otherAdj) return;

        if (dx === -1) {
          // left
          fadj.left = otherAdj;
          return;
        }

        if (dx === 1) {
          // left
          fadj.right = otherAdj;
          return;
        }

        if (dy === -1) {
          // left
          fadj.top = otherAdj;
          return;
        }

        if (dy === 1) {
          // left
          fadj.bottom = otherAdj;
          return;
        }
      });
    });

    const cube = createCubeModel<FaceCells>(
      (cf) => ({ ...cf, offset: cf.offset + 1, cells: rotateCW(cf.cells) }),
      (cf) => ({ ...cf, offset: cf.offset - 1, cells: rotateCCW(cf.cells) })
    );

    // const debug = (m: FaceCells) =>
    //   console.log(
    //     "face:",
    //     m &&
    //       `${Math.floor(m.cells[0][0].origin.y / size)}.${Math.floor(
    //         m.cells[0][0].origin.x / size
    //       )}`
    //   );

    buildCube(cube, faceAdjs[0] /*, debug */);

    // console.log(
    //   Object.entries(cube.faces).map(
    //     ([face, m]) =>
    //       m && {
    //         [face]: `${Math.floor(m.cells[0][0].origin.y / size)}.${Math.floor(
    //           m.cells[0][0].origin.x / size
    //         )}`,
    //         offset: m.offset,
    //       }
    //   )
    // );

    const cubeIsComplete = (
      cube: CubeModel<FaceCells>
    ): cube is CubeModel<FaceCells> & {
      faces: Required<CubeModel<FaceCells>["faces"]>;
    } => {
      return Object.values(cube.faces).every(Boolean);
    };

    function straightUp(cube: CubeModel<FaceCells>, to: number) {
      if (typeof cube.faces.bottom === "undefined")
        throw new Error("Bottom face is empty");

      const start = cube.faces.bottom.offset % 4;

      while (cube.faces.bottom.offset % 4 !== to) {
        if (to < 0) {
          cube.yawLeft();
        } else {
          cube.yawRight();
        }
      }

      return start;
    }

    function getCubeAdj(cube: CubeModel<FaceCells>) {
      const result: Record<
        string,
        Record<
          "top" | "bottom" | "left" | "right",
          { face: Cell[][]; dir: Heading; key: string }
        >
      > = {};

      if (!cubeIsComplete(cube)) throw new Error("Cube is incomplete");

      let ret = straightUp(cube, 0);
      let current = cube.faces.bottom.key;

      result[current] = {
        top: {
          key: cube.faces.back.key,
          face: cube.faces.back.cells,
          dir: rotateHeading("^", cube.faces.back.offset),
        },
        right: {
          key: cube.faces.right.key,
          face: cube.faces.right.cells,
          dir: rotateHeading(">", cube.faces.right.offset),
        },
        bottom: {
          key: cube.faces.front.key,
          face: cube.faces.front.cells,
          dir: rotateHeading("v", cube.faces.front.offset),
        },
        left: {
          key: cube.faces.left.key,
          face: cube.faces.left.cells,
          dir: rotateHeading("<", cube.faces.left.offset),
        },
      };

      straightUp(cube, ret);

      cube.rotateFwd();
      ret = straightUp(cube, 0);
      current = cube.faces.bottom.key;

      result[current] = {
        top: {
          key: cube.faces.back.key,
          face: cube.faces.back.cells,
          dir: rotateHeading("^", cube.faces.back.offset),
        },
        right: {
          key: cube.faces.right.key,
          face: cube.faces.right.cells,
          dir: rotateHeading(">", cube.faces.right.offset),
        },
        bottom: {
          key: cube.faces.front.key,
          face: cube.faces.front.cells,
          dir: rotateHeading("v", cube.faces.front.offset),
        },
        left: {
          key: cube.faces.left.key,
          face: cube.faces.left.cells,
          dir: rotateHeading("<", cube.faces.left.offset),
        },
      };

      straightUp(cube, ret);

      cube.rotateFwd();
      ret = straightUp(cube, 0);
      current = cube.faces.bottom.key;

      result[current] = {
        top: {
          key: cube.faces.back.key,
          face: cube.faces.back.cells,
          dir: rotateHeading("^", cube.faces.back.offset),
        },
        right: {
          key: cube.faces.right.key,
          face: cube.faces.right.cells,
          dir: rotateHeading(">", cube.faces.right.offset),
        },
        bottom: {
          key: cube.faces.front.key,
          face: cube.faces.front.cells,
          dir: rotateHeading("v", cube.faces.front.offset),
        },
        left: {
          key: cube.faces.left.key,
          face: cube.faces.left.cells,
          dir: rotateHeading("<", cube.faces.left.offset),
        },
      };

      straightUp(cube, ret);

      cube.rotateFwd();
      current = cube.faces.bottom.key;
      ret = straightUp(cube, 0);

      result[current] = {
        top: {
          key: cube.faces.back.key,
          face: cube.faces.back.cells,
          dir: rotateHeading("^", cube.faces.back.offset),
        },
        right: {
          key: cube.faces.right.key,
          face: cube.faces.right.cells,
          dir: rotateHeading(">", cube.faces.right.offset),
        },
        bottom: {
          key: cube.faces.front.key,
          face: cube.faces.front.cells,
          dir: rotateHeading("v", cube.faces.front.offset),
        },
        left: {
          key: cube.faces.left.key,
          face: cube.faces.left.cells,
          dir: rotateHeading("<", cube.faces.left.offset),
        },
      };

      straightUp(cube, ret);

      cube.rotateLeft();
      ret = straightUp(cube, 0);
      current = cube.faces.bottom.key;

      result[current] = {
        top: {
          key: cube.faces.back.key,
          face: cube.faces.back.cells,
          dir: rotateHeading("^", cube.faces.back.offset),
        },
        right: {
          key: cube.faces.right.key,
          face: cube.faces.right.cells,
          dir: rotateHeading(">", cube.faces.right.offset),
        },
        bottom: {
          key: cube.faces.front.key,
          face: cube.faces.front.cells,
          dir: rotateHeading("v", cube.faces.front.offset),
        },
        left: {
          key: cube.faces.left.key,
          face: cube.faces.left.cells,
          dir: rotateHeading("<", cube.faces.left.offset),
        },
      };

      straightUp(cube, ret);

      cube.rotateRight();
      cube.rotateRight();
      ret = straightUp(cube, 0);
      current = cube.faces.bottom.key;

      result[current] = {
        top: {
          key: cube.faces.back.key,
          face: cube.faces.back.cells,
          dir: rotateHeading("^", cube.faces.back.offset),
        },
        right: {
          key: cube.faces.right.key,
          face: cube.faces.right.cells,
          dir: rotateHeading(">", cube.faces.right.offset),
        },
        bottom: {
          key: cube.faces.front.key,
          face: cube.faces.front.cells,
          dir: rotateHeading("v", cube.faces.front.offset),
        },
        left: {
          key: cube.faces.left.key,
          face: cube.faces.left.cells,
          dir: rotateHeading("<", cube.faces.left.offset),
        },
      };

      return result;
    }

    const cubeAdj = getCubeAdj(cube);

    // DONE: Make this generic so that it
    // can work with example and any input
    // const cubeAdj = {
    //   "0.1": {
    //     top: { face: rotateCCW(faces["3.0"].cells), dir: ">" },
    //     right: { face: faces["0.2"].cells, dir: ">" },
    //     bottom: { face: faces["1.1"].cells, dir: "v" },
    //     left: { face: rotateCW(rotateCW(faces["2.0"].cells)), dir: ">" },
    //   },
    //   "1.1": {
    //     top: { face: faces["0.1"].cells, dir: "^" },
    //     right: {
    //       face: rotateCW(faces["0.2"].cells),
    //       dir: "^",
    //     },
    //     bottom: { face: faces["2.1"].cells, dir: "v" },
    //     left: { face: rotateCW(faces["2.0"].cells), dir: "v" },
    //   },
    //   "2.1": {
    //     top: { face: faces["1.1"].cells, dir: "^" },
    //     right: { face: rotateCCW(rotateCCW(faces["0.2"].cells)), dir: "<" },
    //     bottom: { face: rotateCCW(faces["3.0"].cells), dir: "<" },
    //     left: { face: faces["2.0"].cells, dir: "<" },
    //   },
    //   "3.0": {
    //     top: { face: faces["2.0"].cells, dir: "^" },
    //     right: {
    //       face: rotateCW(faces["2.1"].cells),
    //       dir: "^",
    //     },
    //     bottom: { face: faces["0.2"].cells, dir: "v" },
    //     left: { face: rotateCW(faces["0.1"].cells), dir: "v" },
    //   },
    //   "2.0": {
    //     top: { face: rotateCCW(faces["1.1"].cells), dir: ">" },
    //     right: { face: faces["2.1"].cells, dir: ">" },
    //     bottom: { face: faces["3.0"].cells, dir: "v" },
    //     left: { face: rotateCCW(rotateCCW(faces["0.1"].cells)), dir: ">" },
    //   },
    //   "0.2": {
    //     top: { face: faces["3.0"].cells, dir: "^" },
    //     right: { face: rotateCCW(rotateCCW(faces["2.1"].cells)), dir: "<" },
    //     bottom: { face: rotateCCW(faces["1.1"].cells), dir: "<" },
    //     left: { face: faces["0.1"].cells, dir: "<" },
    //   },
    // } as const;

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

  const isExample = pathname.includes("example");
  console.log("Part two:", walkCube(grid, isExample ? 4 : 50));
};

if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/${filename}.example.in`);
  console.log("---");
}

await solve(`./input/${filename}.in`);
