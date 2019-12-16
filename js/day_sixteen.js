const fs = require("fs");
const path = require("path");

function multiplyMatrices(m1, m2) {
  var result = [];
  for (var i = 0; i < m1.length; i++) {
    result[i] = [];
    for (var j = 0; j < m2[0].length; j++) {
      var sum = BigInt(0);
      for (var k = 0; k < m1[0].length; k++) {
        sum += (m1[i][k] || BigInt(0)) * (m2[k][j] || BigInt(0));
      }
      result[i][j] = sum;
    }
  }
  return result;
}

const oneDigit = num => (Math.abs(num) > 9 ? num % 10 : num);

const slicer = iteration => step => {
  const from = (2 * step + 1) * iteration + 2 * step;
  const to = from + iteration;
  return { from, to, multiplier: step % 2 === 0 ? 1 : -1 };
};

const insertIn = (arr, from, to, value) => {
  let i = from;

  while (1) {
    arr[i] = value;
    i = i + 1;
    if (i >= to) {
      break;
    }
  }
};

const generateMatrix = size => {
  let pass = 0;
  let rows = [];
  // one pass for each row
  while (pass < size) {
    let k = 0;
    // until we've filled the entire row
    let row = [];
    out: while (1) {
      const fn = slicer(pass);

      const { from, to, multiplier } = fn(k);

      insertIn(row, from, to, BigInt(multiplier));
      k = k + 1;
      if (row.length > size) {
        break out;
      }
    }

    rows.push(row.slice(0, size));
    // at the end of the pass, push the row
    pass = pass + 1;
  }
  return rows;
};

const sum = (arr, from, to) => {
  acc = 0;
  let i = from;

  it: while (i <= to) {
    acc = acc + (arr[i] || 0);
    i = i + 1;
    if (i === arr.length) {
      break it;
    }
  }
  return acc;
};

const FFT = (outputs, iteration) => {
  const fn = slicer(iteration);
  let accumulated = 0;
  let k = 0;
  it: while (1) {
    const { from, to, multiplier } = fn(k);

    const sub = sum(outputs, from, to) * multiplier;

    accumulated = accumulated + sub;

    k = k + 1;
    if (to > outputs.length) {
      break it;
    }
  }
  return oneDigit(Math.abs(accumulated));
};

fs.readFile(
  path.resolve(__dirname, "../", "input/example.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const initialInput = data.split("").map(x => parseInt(x));

    const skip = 0;
    const repeats = 1;

    // const skip = parseInt(initialInput.slice(0, 8).join(""));
    // const repeats = 10000;

    const inputs = Array.from({ length: repeats }, () => [
      ...initialInput
    ]).flat();

    let output = [...inputs];
    let phase = 0;

    const iterations = output.length;

    let matrix = generateMatrix(iterations);

    while (phase < 1) {
      console.log({ phase });
      matrix = multiplyMatrices(matrix, matrix);
      phase = phase + 1;
    }

    let transform = [];

    output.forEach((x, index) => {
      transform[index] = [];
      transform[index][0] = BigInt(x);
    });

    output = multiplyMatrices(matrix, transform);
    console.log(output, matrix);

    console.log(output.slice(skip, skip + 8).join(""));
  }
);
