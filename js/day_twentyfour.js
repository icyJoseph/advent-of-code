const fs = require("fs");
const path = require("path");

const surrounding = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1]
];

const BUG = "#";
const EMPTY = ".";

const adjBugs = (x, y, grid) =>
  surrounding
    .map(([_x, _y]) => (grid[y + _y] || [])[x + _x] || EMPTY)
    .reduce((prev, curr) => (curr === BUG ? prev + 1 : prev), 0);

const cell = (init, x, y, grid, width) => {
  const adj = adjBugs(x, y, grid);

  return {
    value: init,
    x,
    y,
    adj,
    width,
    calc() {
      this.adj = adjBugs(this.x, this.y, grid);
    },
    judge() {
      const curr = this.value;
      if (curr === BUG) {
        switch (this.adj) {
          case 1:
            break;
          default:
            this.value = EMPTY;
        }
      } else {
        switch (this.adj) {
          case 2:
          case 1:
            this.value = BUG;
            break;
          default:
            break;
        }
      }
      grid[y][x] = this.value;
    },
    rating() {
      return this.value === BUG ? Math.pow(2, y * width + x) : 0;
    }
  };
};

const asMap = scan =>
  scan.map(row => `${row.map(cell => cell.value).join("")}`, "").join("\n");

fs.readFile(
  path.resolve(__dirname, "../", "input/day_twentyfour.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const grid = data.split("\n").reduce((prev, row, y) => {
      const rows = row.split("").reduce((acc, val, x) => {
        return [...acc, val];
      }, []);
      return prev.concat([rows]);
    }, []);

    const scan = grid.map((row, y) =>
      row.map((val, x, src) => cell(val, x, y, grid, src.length))
    );

    console.assert(asMap(scan) === data, "Cannot convert scan back to data");

    let snapshots = new Set();

    let minute = 0;
    while (1) {
      scan.forEach(row => {
        row.forEach(cell => cell.calc());
      });

      scan.forEach(row => {
        row.forEach(cell => cell.judge());
      });

      const result = asMap(scan);

      console.log(result);
      console.log("-----");

      if (snapshots.has(result)) {
        break;
      }

      snapshots.add(result);
      minute = minute + 1;
    }

    const bioDiverity = scan.reduce(
      (acc, row) => acc + row.reduce((prev, cell) => cell.rating() + prev, 0),
      0
    );

    console.log(`First to repeat, after ${minute} minutes.`);
    console.log(asMap(scan));

    console.log(bioDiverity);
  }
);
