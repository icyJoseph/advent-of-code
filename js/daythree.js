const fs = require("fs");
const path = require("path");

// of first vector to second vector
const calculateCrossingPoint = ([x0, y0, x1, y1], [x2, y2, x3, y3]) => {
  if (x0 === x1 && x2 === x3) {
    // never cross vertical and parallels
    return null;
  }
  if (y0 === y1 && y2 === y3) {
    // never cross horizontally
    return null;
  }
  if (x0 === x1) {
    // vertical vector
    // then we want to know if y2 is contained in y0,y1
    const crossY = y2 <= Math.max(y0, y1) && y2 >= Math.min(y0, y1);
    const crossX = x1 <= Math.max(x2, x3) && x1 >= Math.min(x2, x3);
    return crossY && crossX && [x0, y2];
  }

  if (y0 === y1) {
    // horizontal vector
    // we want to know if x2 is contained in x0,x1
    const crossY = y1 <= Math.max(y2, y3) && y1 >= Math.min(y2, y3);
    const crossX = x2 <= Math.max(x0, x1) && x2 >= Math.min(x0, x1);

    return crossX && crossY && [x2, y0];
  }

  return null;
};

const checkIfCross = (point, [x0, y0, x1, y1]) => {
  if (x0 === x1) {
    // vertical
    const crossY = point[1] >= Math.min(y0, y1) && point[1] <= Math.max(y0, y1);
    return x1 === point[0] && crossY;
  }
  if (y0 === y1) {
    // horizontal
    const crossX = point[0] >= Math.min(x0, x1) && point[0] <= Math.max(x0, x1);
    return y1 === point[1] && crossX;
  }
};

const parseInstructions = instruction => {
  const [inst, step] = [instruction.substring(0, 1), instruction.substring(1)];
  return [inst, parseInt(step)];
};

const applyInstructions = (instruction, steps, [, , x = 0, y = 0]) => {
  switch (instruction) {
    case "D":
      return [x, y, x, y - steps];
    case "U":
      return [x, y, x, y + steps];
    case "L":
      return [x, y, x - steps, y];
    case "R":
      return [x, y, x + steps, y];
    default:
      return [];
  }
};

const pathAsMatrix = path =>
  path
    .reduce(
      (prev, curr) => {
        const last = prev.slice(-1);
        const next = applyInstructions(...curr, ...last);
        return prev.concat([next]);
      },
      [[0, 0, 0, 0]]
    )
    .slice(1);

const distance = ([a, b]) => Math.abs(a) + Math.abs(b);

const stepsToIntersection = (intersection, cable) => {
  const crossIndex = cable.findIndex(path => {
    return checkIfCross(intersection, path);
  });

  const lastCross = cable[crossIndex];

  return cable
    .slice(0, crossIndex)
    .concat([[lastCross[0], lastCross[1], intersection[0], intersection[1]]])
    .map(([x0, y0, x1, y1]) => Math.abs(x0 - x1) + Math.abs(y0 - y1))
    .reduce((prev, acc) => prev + acc, 0);
};

const combinedStepsToIntersection = (intersection, ...paths) =>
  paths.reduce(
    (prev, curr) => prev + stepsToIntersection(intersection, curr),
    0
  );

fs.readFile(
  path.resolve(__dirname, "../", "input/day_three.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const [leftPath, rightPath] = data
      .split("\n")
      .map(path => path.split(",").map(parseInstructions))
      .map(cable => pathAsMatrix(cable));

    const intersections = rightPath.reduce((prev, curr) => {
      const cross = leftPath
        .map(vector => {
          return calculateCrossingPoint(curr, vector);
        })
        .filter(e => e);
      //   .map(x => distance(x));
      return prev.concat(cross);
    }, []);
    //   .filter(x => x > 0);

    const closest = intersections.map(distance).filter(x => x > 0);

    console.log("Closest intersection occurs at:", Math.min(...closest));

    const combinedSteps = intersections
      .reduce((prev, curr) => {
        const steps = combinedStepsToIntersection(curr, leftPath, rightPath);

        return prev.concat(steps);
      }, [])
      .filter(x => x > 0);

    console.log("Least combined steps: ", Math.min(...combinedSteps));
  }
);
