const fs = require("fs");
const path = require("path");

function gcd(a, b) {
  if (!b) return b === 0 ? a : NaN;
  return gcd(b, a % b);
}

function lcm(a, b) {
  return (a / gcd(a, b)) * b;
}

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

    let last = moons;
    let periods = [];
    let step = 0;

    const axes = [0, 1, 2];
    let [xSnapshots, ySnapshots, zSnapshots] = axes.map(() => new Set());

    while (periods.filter(x => x).length < 3) {
      const newPositions = last.map((moon, i) =>
        newPosition(
          moon,
          last.filter((_, j) => j !== i)
        )
      );

      const [x, y, z] = [0, 1, 2].map(axis =>
        newPositions.map(([pos, vel]) => `${pos[axis]}.${vel[axis]}`).join(".")
      );

      if (!periods[0] && xSnapshots.has(x)) {
        console.log("found x", step);
        periods[0] = step;
      } else {
        xSnapshots.add(x);
      }
      if (!periods[1] && ySnapshots.has(y)) {
        console.log("found y", step);
        periods[1] = step;
      } else {
        ySnapshots.add(y);
      }
      if (!periods[2] && zSnapshots.has(z)) {
        console.log("found z", step);
        periods[2] = step;
      } else {
        zSnapshots.add(z);
      }

      step = step + 1;
      last = newPositions;
    }

    const systemPeriod = periods.reduce(lcm);
    console.log(systemPeriod);
  }
);
