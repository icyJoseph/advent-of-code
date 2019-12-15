const fs = require("fs");
const path = require("path");
const intCode = require("./intCode");

const NORTH = "1";
const SOUTH = "2";
const WEST = "3";
const EAST = "4";

const HITS_WALL = "0";
const MOVES = "1";
const MOVE_TO_OXYGEN = "2";

const ORIGIN = "@";
const WALL = "#";
const PATH = ".";
const OXYGEN = "&";
const EMPTY = " ";

const readMap = (position, map) => {
  const [x, y] = position;
  return map[y][x];
};

const updateMap = (output, input, current, map) => {
  const [x, y] = current;

  let value;

  if (output === HITS_WALL) {
    value = WALL;
  } else if (output === MOVES) {
    value = PATH;
  } else if (output === MOVE_TO_OXYGEN) {
    value = OXYGEN;
  }
  if (value === undefined) throw new Error("Undefined update");

  switch (input) {
    case NORTH:
      map[y + 1] = map[y + 1] || [];
      map[y + 1][x] = value;
      break;
    case SOUTH:
      map[y - 1] = map[y - 1] || [];
      map[y - 1][x] = value;
      break;
    case WEST:
      map[y] = map[y] || [];
      map[y][x + 1] = value;
      break;
    case EAST:
      map[y] = map[y] || [];
      map[y][x - 1] = value;
      break;
    default:
      throw new Error("Failed to update map");
  }
};

const move = (input, position) => {
  const [x, y] = position;
  switch (input) {
    case NORTH:
      return [x, y + 1];
    case SOUTH:
      return [x, y - 1];
    case WEST:
      return [x + 1, y];
    case EAST:
      return [x - 1, y];
    default:
      throw new Error("Failed to update position");
  }
};

const updatePosition = (output, input, position, map) => {
  if (output === HITS_WALL) {
    return position;
  } else {
    return move(input, position, map);
  }
};

const calcNext = (direction, x, y) => {
  switch (direction) {
    case NORTH:
    case SOUTH:
    case WEST:
    case EAST:
    default:
      throw new Error("Error calculating nodes");
  }
};

const findNodes = (x, y, map) => {
  let steps = [];
  [NORTH, SOUTH, WEST, EAST].forEach(direction => {
    let step = 0;
    let next;
    while (next !== WALL) {
      step = step + 1;
      switch (direction) {
        case NORTH:
          next = map[y + step][x];
          break;
        case SOUTH:
          next = map[y - step][x];
          break;
        case WEST:
          next = map[y][x + step];
          break;
        case EAST:
          next = map[y][x - step];
          break;
        default:
          throw new Error("Failed to update map");
      }
    }
    steps.push(step - 1);
  });

  return [NORTH, SOUTH, WEST, EAST]
    .map((direction, index) => {
      let next;
      let _x;
      let _y;
      const step = steps[index];
      switch (direction) {
        case NORTH:
          next = map[y + step][x];
          _x = x;
          _y = y + step;
          break;
        case SOUTH:
          next = map[y - step][x];
          _x = x;
          _y = y - step;
          break;
        case WEST:
          next = map[y][x + step];
          _y = y;
          _x = x + step;
          break;
        case EAST:
          next = map[y][x - step];
          _y = y;
          _x = x - step;
          break;
        default:
          throw new Error("Failed to update map");
      }
      return { node: next, x: _x, y: _y };
    })
    .filter(({ node, x: _x, y: _y }) => node !== WALL && x !== _x && y !== _y);
};

const isNode = (value, y, x, map) => {
  if (value === PATH) {
    const up = map[y + 1][x];
    const down = map[y - 1][x];
    const left = map[y][x + 1];
    const right = map[y][x - 1];

    const options = [up, down, left, right].filter(x => x !== WALL);
    const nodes = findNodes(x, y, map);
    console.log({ nodes, x, y });

    if (!options.length === 1) {
      //dead end
      return false;
    }
    if (options.length === 3) {
      return true;
    }

    if (options.length === 2) {
      if (up === WALL && down === WALL) {
        return false;
      } else if (left === WALL && right === WALL) {
        return false;
      }
      return true;
    }
  }
  if (value === ORIGIN || value === OXYGEN) {
    return true;
  }
  return false;
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_fifteen.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const program = data.split(",").map(x => intCode.parseCell(x));

    const emptyRow = Array.from({ length: 50 }, () => WALL);

    const pixels = Array.from({ length: 50 }, () => [...emptyRow]);

    let input = NORTH;
    const startX = 25;
    const startY = 25;

    let position = [startX, startY];
    let output;
    let it = 0;

    try {
      loop: while (1) {
        const random = Math.floor(Math.random() * 4);
        input = [NORTH, SOUTH, WEST, EAST][random];

        output = intCode.runner(program, input);

        it = it + 1;
        switch (output) {
          case HITS_WALL:
          case MOVES:
            // update map
            // and update position
            updateMap(output, input, position, pixels);
            position = updatePosition(output, input, position, pixels);
            continue loop;
          case MOVE_TO_OXYGEN:
            updateMap(output, input, position, pixels);
            break loop;
          default:
            continue;
        }
      }
    } catch (e) {
      console.log(e);
    }

    pixels[startX][startY] = ORIGIN;

    const image = pixels.reduceRight((prev, row) => {
      const buffer = row.join("");
      return `${prev}\n${buffer}`;
    }, "");

    const nodes = pixels.flatMap((row, i) => {
      const _rowNodes = row
        .map((pixel, j) => {
          const node = isNode(pixel, i, j, pixels);
          if (node) {
            return { node: pixel, x: j, y: i };
          }
          return;
        })
        .filter(e => e);
      return _rowNodes;
    });

    console.log({ nodes });

    console.log(image); // Manually done from here
  }
);
