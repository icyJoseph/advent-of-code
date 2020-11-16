const fs = require("fs");
const path = require("path");
const intCode = require("./intCode");

const EMPTY = "0";
const WALL = "1";
const BLOCK = "2";
const HORIZONTAL = "3";
const BALL = "4";

const drawScreen = canvas =>
  console.log(
    canvas.reduce((prev, row) => {
      const buffer = row.map(drawPixel).join("");
      return `${prev}\n${buffer}`;
    }, "")
  );

function drawPixel(pixel) {
  switch (pixel) {
    case EMPTY:
      return " ";
    case WALL:
      return "|";
    case BLOCK:
      return "#";
    case HORIZONTAL:
      return "=";
    case BALL:
      return "@";
    default:
      throw new Error("Bad Pixel");
  }
}

const NEUTRAL = "0";
const LEFT = "-1";
const RIGHT = "1";

fs.readFile(
  path.resolve(__dirname, "../", "input/day_thirteen.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const instructions = data.split(",");
    const withQuarter = ["2", ...instructions.slice(1)].map(x =>
      intCode.parseCell(x)
    );

    // let outputs = [];
    let joystick = NEUTRAL;
    let scores = [];

    let ball = [];
    let tile;
    const emptyRow = Array.from({ length: 45 }, () => EMPTY);
    const canvas = Array.from({ length: 23 }, () => [...emptyRow]);

    try {
      // wait for the screen to render

      while (1) {
        if (ball.length > 1 && tile && scores.length > 0) {
          drawScreen(canvas);
          const [[x0, y0], [x1, y1]] = ball.map(x => x.map(y => parseInt(y)));
          const [tileX, tileY] = tile.map(x => parseInt(x));
          const xCross =
            x1 + Math.floor(((x1 - x0) * (tileY - y1)) / (y1 - y0)) - 1;

          if (y1 > y0) {
            // ball coming down

            if (tileX === xCross) {
              joystick = NEUTRAL;
            } else if (tileX > xCross) {
              joystick = LEFT;
            } else if (tileX < xCross) {
              joystick = RIGHT;
            }
          } else if (y1 < y0) {
            // ball going up
            // follow the ball
            if (x1 > tileX) {
              joystick = RIGHT;
            } else if (x1 <= tileX) {
              joystick = LEFT;
            } else {
              joystick = NEUTRAL;
            }
          }
        }

        output = intCode.runner(withQuarter, joystick);
        const [_x, _y, _id] = output;

        // width = Math.max(_x, width);
        // height = Math.max(_y, height);

        if (_x === "-1" && _y === "0") {
          scores.push(_id);
        } else {
          if (_id === BALL) {
            if (ball.length === 0) {
              ball.push([parseInt(_x) - 1, parseInt(_y) - 1]);
            } else if (ball.length > 1) {
              ball.shift();
            }
            ball.push([_x, _y]);
          }
          if (_id === HORIZONTAL) {
            tile = [_x, _y];
          }

          if (!canvas[_y]) {
            canvas[_y] = EMPTY;
          }

          canvas[_y][_x] = _id;
        }
      }
    } catch (err) {
      //   console.log(err);
    }

    console.log(scores.slice(-1));
  }
);
