const fs = require("fs");
const path = require("path");

const oneDigit = num => (Math.abs(num) > 9 ? num % 10 : num);

const FFT = (inputs, iteration, base) => {
  const zipLen = inputs.length;

  const _inputs = inputs.slice(iteration);

  const pattern = base
    .map(x => Array.from({ length: iteration + 1 }, () => x))
    .flat();

  const repeats = Math.floor(zipLen / pattern.length);
  const tail = zipLen % pattern.length;

  const head = pattern.shift();

  pattern.push(head);

  const zip = Array.from({ length: repeats }, () => pattern)
    .concat(pattern.slice(0, tail))
    .flat()
    .slice(iteration);

  return oneDigit(
    // Math.abs(inputs.reduce((acc, curr, index) => acc + curr * zip[index], 0))
    Math.abs(_inputs.reduce((acc, curr, index) => acc + curr * zip[index], 0))
  );
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
