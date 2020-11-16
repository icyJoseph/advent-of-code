const fs = require("fs");
const path = require("path");

const WALL = "#";
const ENTRANCE = "@";

const keys = "abcdefghijklmnopqrstuvwxyz";
const doors = keys.toUpperCase();

const bots = ["1", "2", "3", "4"];
const isEntrance = cell => bots.includes(cell);

const isKey = cell => keys.includes(cell);
const isDoor = cell => doors.includes(cell);
const isKeyOrDoor = cell => isKey(cell) || isDoor(cell);

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

  let queue = [{ key, distance: 0, x, y, path: "" }];
  let paths = {};

  for (let item of queue) {
    let { x, y, distance, path } = item;
    const row = maze[y] || [];
    const cell = row[x];
    if (isKeyOrDoor(cell) && distance > 0) {
      paths[cell] = { distance, path };
      path = `${path}${cell}`;
    }

    nodes.add(`${x}.${y}`);

    surrounding.forEach(vector => {
      const [vX, vY] = vector;
      const [_x, _y] = [vX + x, vY + y];
      const _key = `${_x}.${_y}`;

      if (maze[_y][_x] !== WALL && !nodes.has(_key)) {
        queue.push({ x: _x, y: _y, distance: distance + 1, path });
      }
    });
  }

  return paths;
};

const isReachable = (path, currKeys) =>
  path
    .split("")
    .every(
      cell => currKeys.includes(cell.toLowerCase()) || currKeys.includes(cell)
    );

const toNodeMap = maze => {
  return maze.reduce((prev, row, y) => {
    return {
      ...prev,
      ...row.reduce((acc, cell, x) => {
        // only from keys or the entrance
        if (isKey(cell) || isEntrance(cell)) {
          return { ...acc, [cell]: distanceToRest([x, y], maze) };
        }
        return acc;
      }, {})
    };
  }, {});
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_eighteen.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const stream = data.split("\n");

    const pixels = stream.map(row => row.split(""));

    const nodeMap = toNodeMap(pixels);

    const keyNodes = Object.keys(nodeMap).filter(isKey);

    const allKeys = [...new Set(keyNodes)];

    let totalPossibilites = [];

    for (const bot of bots) {
      const possibilities = allKeys.reduce(
        prev => {
          let next = {};

          Object.entries(prev).forEach(([meta, _distance]) => {
            const [curr, currKeys] = meta.split(".");

            for (let undone of allKeys) {
              if (!currKeys.includes(undone)) {
                if (nodeMap[curr][undone]) {
                  let { distance, path } = nodeMap[curr][undone];

                  const reachable = isReachable(path, currKeys);

                  if (reachable) {
                    distance = distance + _distance;
                    let newKeys = [...new Set([...currKeys, undone])];

                    const newMeta = `${undone}.${newKeys.sort().join("")}`;

                    const largerDistance = distance < (next[newMeta] || 0);

                    if (!next[newMeta] || largerDistance) {
                      next[newMeta] = distance;
                    }
                  }
                }
              }
            }
          });
          return next;
        },
        {
          [`${bot}.${""}`]: 0
        }
      );

      console.log("loop", Object.values(possibilities));
      totalPossibilites.push(possibilities);
    }
    console.log(nodeMap);
    console.log(totalPossibilites);
  }
);
