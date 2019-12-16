const fs = require("fs");
const path = require("path");

const oneDigit = num =>
  Math.abs(num) > 9 ? Math.abs(num) % 10 : Math.abs(num);

function decode(output, skip) {
  let result = [];
  const size = output.length;
  let row = size - 1;

  while (row >= skip) {
    result[row] = (result[row + 1] || 0) + output[row];

    row = row - 1;
  }

  return result.map(oneDigit);
}

fs.readFile(
  path.resolve(__dirname, "../", "input/day_sixteen.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const initialInput = data.split("").map(x => parseInt(x));

    const skip = parseInt(initialInput.slice(0, 7).join(""));
    const repeats = 10000;

    const inputs = Array.from({ length: repeats }, () => [
      ...initialInput
    ]).flat();

    let output = [...inputs];
    let phase = 0;

    while (phase < 100) {
      console.log({ phase });
      output = decode(output, skip);
      phase = phase + 1;
    }

    console.log(output.slice(skip, skip + 8).join(""));
  }
);
