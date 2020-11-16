const fs = require("fs");
const path = require("path");

const countDigits = arr =>
  arr
    .flat(Infinity)
    .reduce(
      (prev, curr) =>
        prev[curr]
          ? { ...prev, [curr]: prev[curr] + 1 }
          : { ...prev, [curr]: 1 },
      {}
    );

const compareZeroes = (a, b) => a[0] - b[0];

const toStream = (pixels, size) =>
  Array.from({ length: pixels.length / size }, (_, i) => i).map(layer =>
    pixels.slice(layer * size, layer * size + size)
  );

const toLayers = (stream, width, height) =>
  stream.reduce(
    (prev, curr) => [
      ...prev,
      Array.from({ length: height }, (_, i) => i).map(row =>
        curr.slice(width * row, width * row + width)
      )
    ],
    []
  );

const makeEmptyCanvas = size => Array.from({ length: size }, (_, i) => i);

// 0 is black, 1 is white, and 2 is transparent.
const resolvePixel = (previousLayer, currentLayer) => {
  switch (currentLayer) {
    case "0":
      return previousLayer === null ? "0" : previousLayer;
    case "1":
      return previousLayer === null ? "1" : previousLayer;
    case "2":
    default:
      return previousLayer;
  }
};

const prettyPrint = canvas => ([row, width]) => {
  const pivot = row * width;
  console.log(
    canvas
      .slice(pivot, pivot + width)
      .map(x => (x === "0" ? " " : "*"))
      .join("")
  );
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_eight.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const width = 25;
    const height = 6;
    const size = width * height;

    const stream = toStream(data.split(""), size);
    const layers = toLayers(stream, width, height);

    const [lowestZeroCount] = layers.map(countDigits).sort(compareZeroes);

    console.log(lowestZeroCount[1] * lowestZeroCount[2]);

    const canvas = makeEmptyCanvas(size).map(index => {
      const row = Math.floor(index / width);
      const column = index % width;
      return layers.map(layer => layer[row][column]).reduce(resolvePixel, null);
    });

    Array.from({ length: height }, (_, i) => [i, width]).forEach(
      prettyPrint(canvas)
    );
  }
);
