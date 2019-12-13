const fs = require("fs");
const path = require("path");
const intCode = require("./intCode");

const EMPTY = "0";
const WALL = "1";
const BLOCK = "2";
const HORIZONTAL = "3";
const BALL = "4";

fs.readFile(
  path.resolve(__dirname, "../", "input/day_thirteen.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const instructions = data.split(",").map(x => intCode.parseCell(x));

    let outputs = [];

    try {
      while (1) {
        output = intCode.runner(instructions);
        outputs.push(output);
      }
    } catch (err) {
      console.log(err);
    }

    const blocks = outputs.filter(([, , id]) => id === BLOCK);

    console.log(blocks.length);
  }
);
