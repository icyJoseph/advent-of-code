const fs = require("fs");
const path = require("path");

fs.readFile(
  path.resolve(__dirname, "../", "input/day_eight.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const width = 25;
    const height = 6;
    const size = width * height;

    const pixels = data.split("");

    const layerQty = pixels.length / size;

    const layers = Array.from({ length: layerQty }, (_, i) => i).map(layer =>
      pixels.slice(layer * size, layer * size + size)
    );

    const image = layers.reduce((prev, curr) => {
      const pixelLayer = Array.from({ length: height }, (_, i) => i).map(
        row => {
          const ret = curr.slice(width * row, width * row + width);

          return ret;
        }
      );
      return [...prev, pixelLayer];
    }, []);

    let digitCount = [];

    image.forEach(layer => {
      const digitQty = layer.flat().reduce(
        (prev, curr) => {
          return prev[curr]
            ? { ...prev, [curr]: prev[curr] + 1 }
            : { ...prev, [curr]: 1 };
        },
        { 0: 0, 1: 0, 2: 0 }
      );

      digitCount.push(digitQty);
    });

    // 0 is black, 1 is white, and 2 is transparent.

    const emptyCanvas = Array.from({ length: size }, (_, i) => i);

    const result = emptyCanvas.map(index => {
      const row = Math.floor(index / width);
      const column = index % width;
      const pixel = image
        .map(layer => {
          const ret = layer[row][column];
          return ret;
        })
        .reduce((prev, curr) => {
          switch (curr) {
            case "0":
              return prev === null ? "0" : prev;
            case "1":
              return prev === null ? "1" : prev;
            case "2":
            default:
              return prev;
          }
        }, null);

      return pixel;
    });

    Array.from({ length: height }, (_, i) => i).map(row => {
      const pivot = width * row;
      console.log(
        result
          .slice(pivot, pivot + width)
          .map(x => (x === "0" ? " " : "*"))
          .join("")
      );
    });
  }
);
