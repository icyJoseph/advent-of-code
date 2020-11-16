const fs = require("fs");
const path = require("path");
const intCode = require("./intCode");

const SCAFFOLD = "#";
const SPACE = "•";
const NEWLINE = "\n";

const UP = "^";
const DOWN = "v";
const LEFT = "<";
const RIGHT = ">";
const LOST = "X";

const ASCII_SCAFOLD = "35";
const ASCII_SPACE = "46";
const ASCII_NEWLINE = "10";
const ASCII_LOST = "94";

const isRobot = code => {
  return [UP, DOWN, LEFT, RIGHT].includes(code);
};

const drawScreen = canvas =>
  console.log(
    canvas.reduce((prev, pixel) => {
      return `${prev}${drawPixel(pixel)}`;
    }, "")
  );

const drawPixel = code => {
  if (isRobot(code)) return String.fromCharCode(code);

  switch (code) {
    case ASCII_SCAFOLD:
      return SCAFFOLD;
    case ASCII_SPACE:
      return SPACE;
    case ASCII_NEWLINE:
      return NEWLINE;
    case ASCII_LOST:
      return LOST;
    default:
      //   console.log("Odd code", code);
      return String.fromCharCode(code);
  }
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
        // .flat(Infinity)
        // .map(res => {
        //   console.log(res);
        //   return res;
        // })
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

// left to right characters

fs.readFile(
  path.resolve(__dirname, "../", "input/day_seventeen.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const program = ["2", ...data.split(",").slice(1)]
      .flat()
      .map(x => intCode.parseCell(x));

    const code = `
    A,A,B,C,C,A,B,C,A,B
    L,12,L,12,R,12
    L,8,L,8,R,12,L,8,L,8
    L,10,R,8,R,12
    y
    `;

    console.log("Compiling");
    const input = parseCode(code);
    // console.log(input);

    let outputs = [];

    try {
      while (1) {
        const output = intCode.runner(program, input);
        // console.log("output", output, String.fromCharCode(output));
        outputs.push(output);
      }
    } catch (e) {
      console.log("Err", e);
      drawScreen(outputs);
    }

    const width = outputs.findIndex(x => x === ASCII_NEWLINE) + 1;

    const height = outputs.filter(x => x === ASCII_NEWLINE).length + 1;

    const plot = Array.from({ length: height }, (_, i) =>
      outputs.slice(i * width, (i + 1) * width)
    ).filter(x => x.length === width);

    const nodes = plot
      .map((row, y) => {
        const _row = row
          .map((curr, x) => {
            if (curr !== ASCII_SCAFOLD) return null;
            const up = plot[y - 1] && plot[y - 1][x] === ASCII_SCAFOLD;
            const down = plot[y + 1] && plot[y + 1][x] === ASCII_SCAFOLD;
            const left = plot[y][x - 1] === ASCII_SCAFOLD;
            const right = plot[y][x + 1] === ASCII_SCAFOLD;

            if (up && down && left && right) {
              return { x, y, node: curr };
            }
            return null;
          })
          .filter(x => x);

        return _row;
      }, [])
      .flat();

    const alignment = nodes.reduce((prev, { x, y }) => prev + x * y, 0);

    console.log(width, height);
    // console.log(nodes);
    console.log(alignment);
    console.log("dust", outputs[outputs.length - 1]);
  }
);
