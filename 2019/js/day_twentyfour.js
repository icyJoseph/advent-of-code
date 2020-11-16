const fs = require("fs");
const path = require("path");

const surrounding = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1]
];

const DIMENSION = "?";
const BUG = "#";
const EMPTY = ".";

const createEmptyGrid = (width, height) =>
  Array.from({ length: height }, (_, x) =>
    Array.from({ length: width }, (_, y) =>
      x === 2 && y === 2 ? DIMENSION : EMPTY
    )
  );

const EMPTY_ROW = Array.from({ length: 5 }, () => EMPTY);

const sliceSubGrid = (dimension, height, grid) =>
  grid.slice(dimension * height, (dimension + 1) * height);

const checkAdj = ({ grid, subGrid, y, _y, x, _x, z, height }) => {
  const trueDimension = z + (grid.length / height - 1) / 2;

  const checkOutOfBounds = !subGrid[y + _y] || !subGrid[y + _y][x + _x];

  if (checkOutOfBounds) {
    if (trueDimension === 0) {
      // top dimension
      return EMPTY;
    }
    // otherwise check the upper dimensiono
    const upperSubGrid = sliceSubGrid(trueDimension - 1, height, grid);
    return upperSubGrid[2 + _y][2 + _x];
  }

  const checkCenter = y + _y === 2 && x + _x === 2;

  if (checkCenter) {
    const lowerSubGrid = sliceSubGrid(trueDimension + 1, height, grid);

    if (_y === 0 && _x === -1) {
      // DOWN
      return lowerSubGrid[height - 1] || [...EMPTY_ROW];
    }
    if (_y === 0 && _x === 1) {
      // UP
      return lowerSubGrid[0] || [...EMPTY_ROW];
    }
    if (_y === 1 && _x === 0) {
      //RIGHT
      return lowerSubGrid.reduce(
        (prev, curr) => [...prev, curr[0] || EMPTY],
        []
      );
    }
    if (_y === -1 && _x === 0) {
      //RIGHT
      return lowerSubGrid.reduce(
        (prev, curr) => [...prev, curr[height - 1] || EMPTY],
        []
      );
    }
  }

  return (subGrid[y + _y] || [])[x + _x] || EMPTY;
};

const adjBugs = ({ x, y, z, grid, width, height }) => {
  const lowerBound = z + (grid.length / height - 1) / 2;

  const subGrid = sliceSubGrid(lowerBound, height, grid);

  return surrounding
    .map(([_x, _y]) =>
      checkAdj({
        grid,
        subGrid,
        y,
        _y,
        x,
        _x,
        z,
        height
      })
    )
    .flat(Infinity)
    .reduce((prev, curr) => (curr === BUG ? prev + 1 : prev), 0);
};

const cell = ({ init, x, y, z, grid, width, height }) => {
  return {
    value: init,
    x,
    y,
    z,
    adj: null,
    width,
    height,
    calc() {
      this.adj = adjBugs({
        x: this.x,
        y: this.y,
        z: this.z,
        grid,
        width: this.width,
        height: this.height
      });
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
      } else if (curr === EMPTY) {
        switch (this.adj) {
          case 2:
          case 1:
            this.value = BUG;
            break;
          default:
            break;
        }
      }
      // update the grid
      const lowerBound = z + (grid.length / height - 1) / 2;
      grid[lowerBound * height + y][x] = this.value;
    }
  };
};

const asMap = scan =>
  scan.map(row => `${row.map(cell => cell.value).join("")}`, "").join("\n");

fs.readFile(
  path.resolve(__dirname, "../", "input/example.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const grid = data.split("\n").reduce((prev, row) => {
      const rows = row.split("").reduce((acc, val) => {
        return [...acc, val];
      }, []);
      return prev.concat([rows]);
    }, []);

    const scan = grid.map((row, y) =>
      row.map((val, x) =>
        cell({ init: val, x, y, z: 0, grid, width: 5, height: 5 })
      )
    );

    console.assert(asMap(scan) === data, "Cannot convert scan back to data");

    // let snapshots = new Set();

    let minute = 0;

    while (1) {
      const emptyGrid = createEmptyGrid(5, 5);
      const emptyDimension = emptyGrid.map((row, y) =>
        row.map((val, x) =>
          cell({ init: val, x, y, z: minute + 1, grid, width: 5, height: 5 })
        )
      );

      grid.push(...emptyGrid);
      scan.push(...emptyDimension);

      const emptyUpperGrid = createEmptyGrid(5, 5);
      const upperEmptyDimension = emptyUpperGrid.map((row, y) =>
        row.map((val, x) =>
          cell({ init: val, x, y, z: -(minute + 1), grid, width: 5, height: 5 })
        )
      );

      grid.unshift(...emptyUpperGrid);
      scan.unshift(...upperEmptyDimension);

      scan.forEach(row => {
        row.forEach(cell => cell.calc());
      });

      scan.forEach(row => {
        row.forEach(cell => cell.judge());
      });

      // a minute passes by
      minute = minute + 1;

      // const result = asMap(scan);

      // console.log(result);
      // console.log(grid);
      // console.log("-----");

      // snapshots.add(result);

      if (minute === 10) {
        break;
      }
    }

    const numOfBugs = scan
      .flat(Infinity)
      .reduce((acc, curr) => (curr.value === BUG ? acc + 1 : acc), 0);

    // console.log(grid);
    console.log({ minute, numOfBugs });
  }
);
