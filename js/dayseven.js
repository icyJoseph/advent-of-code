const fs = require("fs");
const path = require("path");
const intCode = require("./dayfive");

function runner(memory, inputs) {
  let output;
  let next = 0;
  let index = 0;
  let inputIndex = 0;

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
          if (increaseInputIndex) inputIndex = inputIndex + 1;
          if (data) output = data;
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
    // console.log(err);
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
        num.every(digit => ["0", "1", "2", "3", "4"].includes(digit))
      )
      .forEach(inputs => {
        const output = Array.from({ length: 5 }, (_, i) => i).reduce(
          (prev, curr) =>
            runner(
              data.split(",").map(cell => intCode.parseCell(cell)),
              [inputs[curr], prev]
            ),
          "0"
        );
        // console.log(output);
        outputs.push({ inputs, output });
      });

    outputs.sort((a, b) => parseInt(b.output) - parseInt(a.output));
    console.log(outputs[0]);
  }
);
