const fs = require("fs");
const path = require("path");

const applyGravity = (position, otherMoons, vComponent, axis) => {
  const _axisPos = position[axis];
  const _relAxisPos = otherMoons.map(x => x[0]).map(pos => pos[axis]);

  const change = _relAxisPos.reduce((prev, curr) => {
    if (_axisPos === curr) {
      return prev;
    }
    return _axisPos > curr ? prev - 1 : prev + 1;
  }, 0);
  return vComponent + change;
};

const newPosition = ([position, velocity], otherMoons) => {
  const _velocity = velocity.map((vComponent, axis) =>
    applyGravity(position, otherMoons, vComponent, axis)
  );

  const _position = _velocity.map(
    (rComponent, axis) => position[axis] + rComponent
  );

  return [_position, _velocity];
};

const energy = ([x, y, z]) => Math.abs(x) + Math.abs(y) + Math.abs(z);

fs.readFile(
  path.resolve(__dirname, "../", "input/day_twelve.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const steps = 1000;
    const initial = [0, 0, 0];

    const moons = data
      .split("\n")
      .map(row =>
        row
          .replace("<", "")
          .replace(">", "")
          .split(",")
          .map(x => parseInt(x.split("=")[1]))
      )
      .map(moon => [moon, initial]);

    const universe = {};

    const simulated = Array.from({ length: steps }, (_, i) => i).reduce(
      prev => {
        const [last] = prev.slice(-1);
        const curr = last.map((moon, i) =>
          newPosition(moon, last.slice(0, i).concat(last.slice(i + 1)))
        );

        const snapshot = curr
          .slice(0)
          .flat(Infinity)
          .join(".");

        universe[snapshot] = true;

        return prev.concat([curr]);
      },
      [moons]
    );

    const [end] = simulated.slice(-1);

    const totalEnergy = end
      .map(x => x.map(y => energy(y)))
      .map(x => x[0] * x[1])
      .reduce((acc, curr) => curr + acc, 0);

    console.log(totalEnergy);
  }
);
