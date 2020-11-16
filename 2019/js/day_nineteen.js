const fs = require("fs");
const path = require("path");
const intCode = require("./intCode");

const drawScreen = canvas =>
  console.log(
    canvas.reduce((prev, row) => {
      const buffer = row.join("");
      return `${prev}\n${buffer}`;
    }, "")
  );

fs.readFile(
  path.resolve(__dirname, "../", "input/day_nineteen.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const width = 100;
    const height = 100;

    const map = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => "")
    );

    let output;
    // console.log(map);

    let final = {};
    let xOffset = 1523;
    let yOffset = 1022;

    let done = false;
    while (!done) {
      let beam = {};
      map.forEach((row, y) => {
        row.forEach((_, x) => {
          try {
            output = intCode.runner(
              data.split(",").map(x => intCode.parseCell(x)),
              [x + xOffset, y + yOffset]
            );
            map[y][x] = output === "1" ? "#" : ".";
            beam[`${x}.${y}`] = output;
          } catch (e) {
            // pass
          }
        });
      });

      done = Object.values(beam).every(val => val === "1");
      drawScreen(map);
      final = beam;
      xOffset = xOffset + 1;
      // yOffset = yOffset + 1;
    }

    console.log({ xOffset, yOffset });

    console.log(Object.values(final).filter(val => val === "1").length);
  }
);
