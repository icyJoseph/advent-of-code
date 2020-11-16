const fs = require("fs");
const path = require("path");
const intCode = require("./dayfive");

function runner(memory, input) {
  let output;
  let pointer = 0;
  let relativeBase = 0;

  if (memory.state) {
    output = memory.state.output;
    pointer = memory.state.pointer;
    relativeBase = memory.state.relativeBase;
  }

  try {
    outer: while (true) {
      if (memory[pointer].operation) {
        const {
          skip = 0,
          data,
          jumpTo,
          newRelativeBase
        } = intCode.mutateMemory(
          memory,
          memory[pointer],
          pointer,
          input,
          relativeBase
        );
        if (newRelativeBase !== undefined) {
          relativeBase = newRelativeBase;
        }

        if (data) {
          output = data;
          memory.state = {
            output,
            pointer: pointer + skip,
            relativeBase
          };
        }

        if (jumpTo !== undefined) {
          pointer = jumpTo;
          continue outer;
        } else {
          pointer = pointer + skip;
        }
      }
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
