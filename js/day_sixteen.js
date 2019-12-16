const fs = require("fs");
const path = require("path");

const oneDigit = num => (Math.abs(num) > 9 ? num % 10 : num);

const toSlice = iteration => step => {
  const from = (2 * step + 1) * iteration + 2 * step;
  const to = from + iteration;
  return { from, to, multiplier: step % 2 === 0 ? 1 : -1 };
};

const FFT = (inputs, iteration) => {
  const fn = toSlice(iteration);
  let accumulated = 0;
  let k = 0;
  it: while (1) {
    const { from, to, multiplier } = fn(k);

    const sub =
      inputs.slice(from, to + 1).reduce((acc, curr) => acc + curr, 0) *
      multiplier;

    accumulated = accumulated + sub;

    k = k + 1;
    if (to > inputs.length) {
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

    // const repeats = 10000;
    const repeats = 1;

    const initialInput = data.split("").map(x => parseInt(x));

    const skip = 0;
    // const skip = parseInt(initialInput.slice(0, 8).join(""));

    const inputs = Array.from({ length: repeats }, () => [
      ...initialInput
    ]).flat();

    let output = [...inputs];
    let phase = 0;
    const startBase = [0, 1, 0, -1];

    while (phase < 100) {
      console.log("phase", phase);
      const next = Array.from({ length: output.length }, (_, iteration) => {
        // console.log("inner iteration", iteration, output.length);
        // these are independent
        const fft = FFT(output, iteration, startBase);
        return fft;
      });

      output = [...next];

      phase = phase + 1;
    }

    console.log(output.slice(skip, skip + 8).join(""));
  }
);
