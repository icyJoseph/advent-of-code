const fs = require("fs");
const path = require("path");

const oneDigit = num =>
  Math.abs(num) > 9 ? Math.abs(num) % 10 : Math.abs(num);

const calcMultipler = (row, index) => {
  const arc = 4 * (row + 1);
  const diff = (index - row) % arc;
  const coef = Math.floor(diff / (row + 1));

  const next = coef === 0 || coef === 2 ? index + 2 * (row + 1) : index + 1;

  switch (coef) {
    case 0:
      // return 1;
      return { mult: 1, next };
    case 3:
    case 1:
      // return 0;
      return { mult: 0, next };
    case 2:
      // return -1;
      return { mult: -1, next };
    default:
      throw new Error("Bad coef");
  }
};

function fastSum(arr, from, to) {
  let step = from;
  let acc = 0;
  while (step < to) {
    acc = acc + (arr[step] || 0);
    step = step + 1;
  }
  return acc;
}

function decode(size, output, skip) {
  let result = [];
  let row = skip;
  let sign = 1;
  while (row < size) {
    console.log({ row });
    let index = row;
    let sum = 0;
    while (index < size) {
      const { next } = calcMultipler(row, index);
      sum =
        sum + sign * fastSum(output, index, Math.min(index + row + 1, size));
      sign = -1 * sign;
      index = next;
    }
    result[row] = oneDigit(sum);
    row = row + 1;
  }

  return result;
}

fs.readFile(
  path.resolve(__dirname, "../", "input/day_sixteen.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const initialInput = data.split("").map(x => parseInt(x));

    // const skip = 0;
    // const repeats = 1;

    const skip = parseInt(initialInput.slice(0, 7).join(""));
    const repeats = 10000;

    const inputs = Array.from({ length: repeats }, () => [
      ...initialInput
    ]).flat();

    let output = [...inputs];
    let phase = 0;

    const iterations = output.length;
    while (phase < 100) {
      console.log({ phase, total: iterations - skip });
      output = decode(iterations, output, skip);
      phase = phase + 1;
    }

    console.log(output.slice(skip, skip + 8).join(""));
  }
);

// 73757050 too high
