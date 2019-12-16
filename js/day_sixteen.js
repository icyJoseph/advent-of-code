const fs = require("fs");
const path = require("path");

const oneDigit = num => (Math.abs(num) > 9 ? num % 10 : num);

const slicer = iteration => step => {
  const from = (2 * step + 1) * iteration + 2 * step;
  const to = from + iteration;
  return { from, to, multiplier: step % 2 === 0 ? 1 : -1 };
};

const sum = (arr, from, to) => {
  acc = 0;
  let i = from;

  while (i <= to) {
    acc = acc + (arr[i] || 0);
    i = i + 1;
    if (i === arr.length) {
      break;
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
  path.resolve(__dirname, "../", "input/day_sixteen.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const initialInput = data.split("").map(x => parseInt(x));

    // const skip = 0;
    // const repeats = 1;

    const skip = parseInt(initialInput.slice(0, 8).join(""));
    const repeats = 10000;

    const inputs = Array.from({ length: repeats }, () => [
      ...initialInput
    ]).flat();

    let output = [...inputs];
    let phase = 0;

    while (phase < 100) {
      console.log("phase", phase);
      const next = Array.from({ length: output.length }, (_, iteration) => {
        // console.log("inner iteration", iteration, output.length, phase);
        // these are independent
        const fft = FFT(output, iteration);
        return fft;
      });

      output = [...next];

      phase = phase + 1;
    }

    console.log(output.slice(skip, skip + 8).join(""));
  }
);
