const fs = require("fs");
const path = require("path");
const intCode = require("./dayfive");

function runner(memory, input) {
  let output;
  let next = 0;
  let index = 0;
  let relativeBase = 0;

  try {
    outer: while (true) {
      if (next === index) {
        if (memory[index].operation) {
          const {
            skip = 0,
            data,
            jumpTo,
            newRelativeBase
          } = intCode.mutateMemory(
            memory,
            memory[index],
            index,
            input,
            relativeBase
          );
          if (newRelativeBase !== undefined) {
            relativeBase = newRelativeBase;
          }

          if (data) {
            output = data;
          }

          if (jumpTo !== undefined) {
            next = jumpTo;
            index = jumpTo;
            continue outer;
          } else {
            next = next + skip;
          }
        }
      }
      index = index + 1;
    }
  } catch (err) {
    throw output;
  }
}

fs.readFile(
  path.resolve(__dirname, "../", "input/day_nine.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const program = data.split(",").map(cell => intCode.parseCell(cell));

    try {
      runner(program, "2");
    } catch (e) {
      output = e;
    }

    return console.log(output);
  }
);
