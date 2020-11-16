const fs = require("fs");
const path = require("path");

const ORIGIN = "@";
const WALL = "#";
const PATH = ".";
const OXYGEN = "&";
const FILLED = "O";

const makeNodes = acc => (plot, node, step = 0) => {
  acc.push(step);
  const [i, j] = node;
  const pixel = plot[i][j];

  if (pixel === PATH || pixel === OXYGEN || pixel === ORIGIN) {
    plot[i][j] = FILLED;

    return {
      value: pixel,
      node,
      adjacent: [
        {
          node: [i + 1, j],
          value: plot[i + 1][j]
        },
        {
          node: [i - 1, j],
          value: plot[i - 1][j]
        },
        {
          node: [i, j + 1],
          value: plot[i][j + 1]
        },
        {
          node: [i, j - 1],
          value: plot[i][j - 1]
        }
      ]
        .filter(({ value }) => value !== WALL && value !== FILLED)
        .map(({ node }) => makeNodes(acc)(plot, node, step + 1))
    };
  }
  if (pixel === WALL || pixel === FILLED) {
    return { value: pixel, node };
  }
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_fifteen_2.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const plot = data.split("\n").map(row => row.split(""));

    const nodes = plot
      .map((row, i) => {
        const pixels = row
          .map((pixel, j) => {
            if (pixel === PATH || pixel === OXYGEN) {
              const adjacent = {
                value: pixel,
                node: [i, j],
                up: plot[i + 1][j],
                down: plot[i - 1][j],
                right: plot[i][j + 1],
                left: plot[i][j - 1]
              };
              return adjacent;
            }

            return;
          })
          .filter(e => e);
        return pixels;
      })
      .filter(e => e.length)
      .flat();

    let levels = [];
    const { node } = nodes.find(node => node.value === OXYGEN);
    const builder = makeNodes(levels);
    builder(plot, node);

    console.log(Math.max(...levels));
  }
);
