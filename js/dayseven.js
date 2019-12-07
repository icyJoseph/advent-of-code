const fs = require("fs");
const path = require("path");
const intCode = require("./dayfive");

function runner(memory, inputs) {
  let output;
  let next = 0;
  let index = 0;
  let inputIndex = 0;

  if (memory.state) {
    output = memory.state.output;
    next = memory.state.next;
    index = memory.state.index;
    inputIndex = memory.state.inputIndex;
  }

  try {
    outer: while (true) {
      if (next === index) {
        if (memory[index].operation) {
          const {
            skip = 0,
            data,
            jumpTo,
            increaseInputIndex
          } = intCode.mutateMemory(
            memory,
            memory[index],
            index,
            inputs[inputIndex]
          );
          if (increaseInputIndex) {
            if (inputIndex === 0) {
              inputIndex = inputIndex + 1;
            }
          }

          if (data) {
            output = data;

            memory.state = {
              output,
              next: next + skip,
              index,
              inputIndex,
              inputs
            };

            break outer;
          }

          if (jumpTo) {
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
  return output;
}

fs.readFile(
  path.resolve(__dirname, "../", "input/day_seven.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    let outputs = [];

    Array.from({ length: 100_000 }, (_, i) => {
      return ["0", "0", "0", "0", ...i.toString().split("")].slice(-5);
    })
      .filter(x => [...new Set(x)].length === 5)
      .filter(num =>
        num.every(digit => ["5", "6", "7", "8", "9"].includes(digit))
      )
      .forEach(phases => {
        const amps = Array.from({ length: 5 }, (_, i) => i).map(() =>
          data.split(",").map(cell => intCode.parseCell(cell))
        );

        let iteration = 0;
        let inputs = [phases[0], "0"];

        while (1) {
          try {
            output = runner(amps[iteration % 5], inputs);
            iteration = iteration + 1;
            inputs = [phases[iteration % 5], output];
          } catch (err) {
            output = err;
            if (iteration % 5 === 4) {
              break;
            } else {
              iteration = iteration + 1;
              inputs = [phases[iteration % 5], output];
              continue;
            }
          }
        }
        outputs.push({ phases, output });
      });

    outputs.sort((a, b) => parseInt(b.output) - parseInt(a.output));
    console.log(outputs[0]);
  }
);
