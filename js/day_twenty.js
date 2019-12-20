const fs = require("fs");
const path = require("path");

const WALL = "#";
const SPACE = " ";
const PATH = ".";

const ENTRANCE = "AA";
const EXIT = "ZZ";

const surrounding = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1]
];

const distanceToRest = (pointA, maze) => {
  const [x, y] = pointA;

  const nodes = new Set();

  const key = `${x}.${y}`;

  nodes.add(key);

  let queue = [{ distance: 0, x, y }];
  let paths = {};

  for (let item of queue) {
    let { x, y, distance } = item;

    const row = maze[y] || [];
    const { cell } = row[x] || {};

    if (distance > 0) {
      paths[cell] = distance;
    }

    nodes.add(`${x}.${y}`);

    surrounding.forEach(vector => {
      const [vX, vY] = vector;
      const [_x, _y] = [vX + x, vY + y];
      const _key = `${_x}.${_y}`;

      const { portal } = (maze[_y] || {})[_x] || {};

      if (portal) {
        if (!nodes.has(_key)) {
          queue.push({ x: _x, y: _y, distance: distance + 1 });
        }
      } else {
        const isPath = maze[_y] && maze[_y][_x].cell === PATH;

        if (isPath && !nodes.has(_key)) {
          queue.push({ x: _x, y: _y, distance: distance + 1 });
        }
      }
    });
  }

  return paths;
};

const toNodeMap = maze => {
  return maze.reduce((prev, row) => {
    return {
      ...prev,
      ...row.reduce((acc, { cell, portal, x, y }) => {
        if (portal) {
          return {
            ...acc,
            [cell]: {
              ...prev[cell],
              ...acc[cell],
              ...distanceToRest([x, y], maze)
            }
          };
        }
        return acc;
      }, {})
    };
  }, {});
};

const maybePortal = (pixels, cell, x, y) => {
  let neighbors = { cell, x, y };

  for (const [_x, _y] of surrounding) {
    if (!pixels[y + _y]) continue;

    const _cell = pixels[y + _y][x + _x];

    if (!_cell) {
      continue;
    }

    if (_cell === WALL || _cell === SPACE || _cell === PATH) {
      continue;
    }

    const __cell = pixels[y + _y + _y][x + _x + _x];
    const portal = [_cell, __cell].sort().join("");

    neighbors = {
      cell: portal,
      x,
      y,
      portal: [_cell, __cell].sort().join("")
    };
  }

  return neighbors;
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_twenty.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const pixels = data.split("\n").map(row => row.split(""));

    const maze = pixels.map((row, y) => {
      return row.map((cell, x) => {
        if ([WALL, SPACE].includes(cell)) {
          return {
            cell,
            x,
            y
          };
        }
        if (cell === PATH) {
          return maybePortal(pixels, cell, x, y);
        }
        return { cell, x, y };
      });
    });

    const nodes = toNodeMap(maze);

    const keyNodes = Object.keys(nodes);

    const allKeys = [...new Set(keyNodes)].sort();

    const possibilities = allKeys.reduce(
      prev => {
        let next = {};

        Object.entries(prev).forEach(([meta, _distance]) => {
          const [curr, ...currKeys] = meta.split(".");

          for (let undone of allKeys) {
            if (!currKeys.includes(undone)) {
              if (nodes[curr][undone]) {
                let distance = nodes[curr][undone];

                distance = distance + _distance;

                let newKeys = [...new Set([...currKeys, undone])];

                const newMeta = `${undone}.${newKeys.join(".")}`;

                const largerDistance = distance < (next[newMeta] || 0);

                if (!next[newMeta] || largerDistance) {
                  next[newMeta] = distance;
                }
              }
            }
          }
        });

        return next;
      },
      {
        [`${ENTRANCE}`]: 0
      }
    );

    const paths = Object.keys(possibilities).map(x => {
      const entrance = x.indexOf(ENTRANCE);
      const exit = x.indexOf(EXIT);
      return x.slice(entrance, exit + 2).split(".");
    });

    const distances = paths.map(path => {
      return path.reduce((prev, curr, index, src) => {
        const next = src[index + 1];
        const distance = next ? nodes[curr][next] + 1 : 0;
        return prev + distance;
      }, -1);
    });

    console.log(Math.min(...distances));
  }
);
