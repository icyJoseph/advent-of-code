const fs = require("fs");
const path = require("path");

const WALL = "#";
const PATH = ".";
const ENTRANCE = "@";

const keys = "abcdefghijklmnopqrstuvwxyz";
const doors = keys.toUpperCase();

const dictionary = keys.split("").map(x => ({ key: x, door: x.toUpperCase() }));

const drawScreen = canvas =>
  console.log(
    canvas.reduce((prev, row) => {
      const _row = row.join("");
      return `${prev}\n${_row}`;
    }, "")
  );

const distance = ([x0, y0], [x1, y1]) => Math.abs(x0 - x1) + Math.abs(y0 - y1);

const itsKeyOrDoor = (maze, _x, _y) => {
  if (maze[_y]) {
    const cell = maze[_y][_x];
    return keys.includes(cell) || doors.includes(cell);
  }
  return false;
};

const hitsWall = (maze, _x, _y) => {
  return maze[_y] && maze[_y][_x] === WALL;
};

const walkToJunctions = (maze, x, y) => {
  let links = [];

  ["up", "right", "left", "down"].forEach(mode => {
    let step = 0;
    switch (mode) {
      case "up":
        // up
        while (1) {
          if (hitsWall(maze, x, y + step + 1)) {
            break;
          } else if (itsKeyOrDoor(maze, x, y + step + 1)) {
            step = step + 1;
            break;
          }
          step = step + 1;
        }
        if (y + step !== y) {
          links.push({ cell: maze[y + step][x], x, y: y + step, mode });
        }
        break;
      case "right":
        // right
        while (1) {
          if (hitsWall(maze, x + step + 1, y)) {
            break;
          } else if (itsKeyOrDoor(maze, x + step + 1, y)) {
            step = step + 1;
            break;
          }
          step = step + 1;
        }
        if (x + step !== x) {
          links.push({ cell: maze[y][x + step], x: x + step, y, mode });
        }
        break;
      case "down":
        // down
        while (1) {
          if (hitsWall(maze, x, y - (step + 1))) {
            break;
          } else if (itsKeyOrDoor(maze, x, y - (step + 1))) {
            step = step + 1;
            break;
          }
          step = step + 1;
        }
        if (y - step !== y) {
          links.push({ cell: maze[y - step][x], x, y: y - step, mode });
        }
        break;

      case "left":
        // left
        while (1) {
          if (hitsWall(maze, x - (step + 1), y)) {
            break;
          } else if (itsKeyOrDoor(maze, x - (step + 1), y)) {
            step = step + 1;
            break;
          }
          step = step + 1;
        }
        if (x - step !== x) {
          links.push({ cell: maze[y][x - step], x: x - step, y, mode });
        }
        break;

      default:
        throw new Error("Uncertain paths length");
    }
  });
  return links;
};

const isJunction = (maze, cell, x, y) => {
  if (cell === ENTRANCE) {
    return walkToJunctions(maze, x, y);
  }
  if (keys.includes(cell) || doors.includes(cell)) {
    return walkToJunctions(maze, x, y);
  }
  if (cell === WALL) return false;
  const up = maze[y + 1][x];
  const down = maze[y - 1][x];
  const right = maze[y][x + 1];
  const left = maze[y][x - 1];

  const paths = [up, down, right, left].filter(x => x !== WALL);

  switch (paths.length) {
    case 4:
    case 1:
      return null;
    case 3:
      // find junction links
      return walkToJunctions(maze, x, y);
    case 2:
      if (up === WALL && down === WALL) {
        return null;
      } else if (right === WALL && left === WALL) {
        return null;
      }
      // find junction links
      return walkToJunctions(maze, x, y);
    default:
      throw new Error("Uncertain paths length");
  }
};

const findNextCell = (pixels, cell) => {
  const _y = pixels.findIndex(y => y.includes(cell));
  if (_y === -1) {
    return { _y: -1, _x: -1 };
  }
  const _x = pixels[_y].findIndex(y => y === cell);
  return { _x, _y };
};

fs.readFile(
  path.resolve(__dirname, "../", "input/example.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const stream = data.split("\n");

    const height = stream.length;
    const width = stream[0].split("").length;

    const pixels = stream.map(row => row.split(""));

    // from 0 to width - 1 and height -1

    const nodes = pixels
      .map((row, y) => {
        const _row = row
          .map((cell, x) => {
            if (cell === WALL || cell === PATH) return null;

            if (cell === ENTRANCE) {
              // find a
              const { _x, _y } = findNextCell(pixels, "a");

              return {
                cell,
                nextCell: "a",
                nextCoords: { x: _x, y: _y },
                x,
                y
              };
            }
            // find cell to upper case
            const upper = cell.toUpperCase();

            if (upper === cell) {
              // already upper case, it is a door
              // find the next step but lowercase
              const nextIndex =
                dictionary.findIndex(({ door }) => door === cell) + 1;
              if (dictionary[nextIndex]) {
                const nextCell = dictionary[nextIndex].key;
                const { _x, _y } = findNextCell(pixels, nextCell);

                return {
                  cell: nextCell,
                  nextCell: dictionary[nextIndex].door,
                  nextCoords: { x: _x, y: _y },
                  x,
                  y
                };
              }
              return null;
            }
            // this is a key
            const { _y, _x } = findNextCell(pixels, upper);
            return {
              cell,
              nextCell: upper,
              nextCoords: { x: _x, y: _y },
              x,
              y
            };
          })
          .filter(x => x && x.x >= 0 && x.y >= 0);
        return _row;
      })
      .flat();

    const junctions = pixels
      .map((row, y) => {
        const _junctions = row
          .map((cell, x) => {
            const _isJunction = isJunction(pixels, cell, x, y);
            if (_isJunction) {
              return { cell, x, y, links: _isJunction };
            }
            return null;
          })
          .filter(e => e);
        return _junctions;
      })
      .flat()
      .filter(e => e);

    console.log(width, height);

    drawScreen(pixels);
    console.log(nodes);
    console.log(JSON.stringify(junctions, undefined, 2));

    // walk the junctions

    let unlocked = [];

    const totalKeys = nodes
      .filter(({ cell }) => cell.toLowerCase() === cell && cell !== PATH)
      .map(({ cell }) => cell);
    console.log(totalKeys);
  }
);
