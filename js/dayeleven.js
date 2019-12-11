const fs = require("fs");
const path = require("path");
const intCode = require("./intCode");

const UP = "UP";
const DOWN = "DOWN";
const RIGHT = "RIGHT";
const LEFT = "LEFT";

function moveRobot(position, instruction) {
  const [last] = position.slice(-1);
  const [x, y, facing] = last.split(".");

  const _x = parseInt(x);
  const _y = parseInt(y);

  // turn left 90 degrees
  if (instruction === "0") {
    if (facing === UP) {
      position.push(`${_x - 1}.${_y}.${LEFT}`);
    } else if (facing === LEFT) {
      position.push(`${_x}.${_y - 1}.${DOWN}`);
    } else if (facing === DOWN) {
      position.push(`${_x + 1}.${_y}.${RIGHT}`);
    } else if (facing === RIGHT) {
      position.push(`${_x}.${_y + 1}.${UP}`);
    }
  } else if (instruction === "1") {
    // turn right 90 degrees
    if (facing === UP) {
      position.push(`${_x + 1}.${_y}.${RIGHT}`);
    } else if (facing === LEFT) {
      position.push(`${_x}.${_y + 1}.${UP}`);
    } else if (facing === DOWN) {
      position.push(`${_x - 1}.${_y}.${LEFT}`);
    } else if (facing === RIGHT) {
      position.push(`${_x}.${_y - 1}.${DOWN}`);
    }
  }
  return position;
}

fs.readFile(
  path.resolve(__dirname, "../", "input/day_eleven.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const program = data.split(",").map(intCode.parseCell);

    const robot = ["25.25.UP"];
    const cells = { "25.25": "1" }; // all black

    try {
      while (1) {
        const [current] = robot.slice(-1);
        const [_x, _y] = current.split(".");

        input = cells[`${_x}.${_y}`] || "0";

        const output = intCode.runner(program, input);

        // paint where the robot is
        const [paint, instruction] = output;

        cells[`${_x}.${_y}`] = paint;

        // move
        moveRobot(robot, instruction);
      }
    } catch (halt) {
      console.log(halt);
    }

    const uniqueCells = robot.map(x =>
      x
        .split(".")
        .slice(0, 2)
        .join(".")
    );

    console.log([...new Set(uniqueCells)].length);
    console.log(Object.keys(cells).length);

    const canvas = Object.keys(cells).reduce((prev, cell) => {
      const [x, y] = cell.split(".");
      const _x = parseInt(x);
      const _y = parseInt(y);
      if (prev[_x]) {
        prev[_x][_y] = cells[cell];
      } else {
        prev[_x] = [];
        prev[_x][_y] = cells[cell];
      }
      return prev;
    }, []);

    const pixels = canvas.filter(x => x).map(x => x.filter(e => e));
    const height = Math.max(...pixels.map(x => x.length));

    const withPadding = pixels.map(column => {
      const len = column.length;
      if (len < height) {
        return column.concat(Array.from({ length: height - len }, () => "0"));
      }
      return column;
    });

    const rotated = Array.from(
      { length: height },
      (_, i) => height - 1 - i
    ).reduce((prev, curr) => {
      const row = withPadding.reduce(
        (acc, column) => acc.concat(column[curr]),
        []
      );
      return prev.concat([row]);
    }, []);

    const image = rotated.reduce((prev, row) => {
      const buffer = row.map(x => (x === "0" ? " " : "*")).join("");
      return `${prev}\n${buffer}`;
    }, "");

    console.log(image);
  }
);
