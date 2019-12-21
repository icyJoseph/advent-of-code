const fs = require("fs");
const path = require("path");
const intCode = require("./intCode");

const ASCII_NEWLINE = "10";

const drawScreen = canvas =>
  console.log(
    canvas.reduce((prev, pixel) => {
      return `${prev}${drawPixel(pixel)}`;
    }, "")
  );

const drawPixel = code => {
  return String.fromCharCode(code);
};

const parseCode = code => {
  const ret = code
    .split("\n")
    .map(row => row.trim())
    .filter(e => e)
    .map(row =>
      row
        .split(",")
        .map(code => code.split("").map(x => x.charCodeAt(0)))
        .reduce((prev, curr, index, src) => {
          if (index === src.length || index === 0) {
            return [...prev, curr];
          }
          return [...prev, `${",".charCodeAt(0)}`, curr];
        }, [])
        .flat(Infinity)
        .concat(ASCII_NEWLINE)
    );

  return ret.flat().map(x => `${x}`);
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_twentyone.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const program = data.split(",").map(x => intCode.parseCell(x));

    /*
    AND X Y sets Y to true if both X and Y are true; otherwise, it sets Y to false.
    OR X Y sets Y to true if at least one of X or Y is true; otherwise, it sets Y to false.
    NOT X Y sets Y to true if X is false; otherwise, it sets Y to false.

    If there is ground at the given distance, the register will be true; 
    if there is a hole, the register will be false.

    For part one D & (!A || !B || !C) works
    For part two extend with (E || H) => D & (!A || !B || !C) & (E || H)

    One must reset the Temp variable!
    NOT T T
    AND T T

    */

    const code = `
    NOT B T
    OR T J
    NOT A T
    OR T J
    NOT C T
    OR T J
    AND D J
    NOT T T
    AND T T
    OR E T
    OR H T
    AND T J
    RUN
    `;

    const input = parseCode(code);

    let outputs = [];
    let hullDmg = [];

    try {
      while (1) {
        const output = intCode.runner(program, input);

        if (parseInt(output) > 127) {
          hullDmg.push(output);
        }

        outputs.push(output);
      }
    } catch (e) {}
    drawScreen(outputs);
    console.log(hullDmg);
  }
);
