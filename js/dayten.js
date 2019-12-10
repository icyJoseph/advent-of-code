const fs = require("fs");
const path = require("path");

const empty = ".";

const blockedByObject = (asteroids, pointA, pointC) => {
  const targets = Object.keys(asteroids).filter(
    key => key !== pointC && key !== pointA
  );

  const [xA, yA] = pointA.split(".").map(x => parseInt(x));
  const [xC, yC] = pointC.split(".").map(x => parseInt(x));

  //   const slope = [yC - yA, xC - xA]; // future optimization

  const blockedBy = targets.find(key => {
    const [xB, yB] = key.split(".").map(x => parseInt(x));

    if (
      xB <= Math.max(xA, xC) &&
      xB >= Math.min(xA, xC) &&
      yB <= Math.max(yA, yC) &&
      yB >= Math.min(yA, yC)
    ) {
      return (yC - yB) * (xB - xA) === (yB - yA) * (xC - xB);
    }
    return false;
  });

  return blockedBy;
};

const distance = (pointA, pointC) => {
  const [xA, yA] = pointA.split(".").map(x => parseInt(x));
  const [xC, yC] = pointC.split(".").map(x => parseInt(x));
  return Math.abs(xC - xA) + Math.abs(yC - yA);
};

const toPolar = ([dx, dy]) => {
  const angle = Math.atan(dx / dy);
  let degrees = (angle * 180) / Math.PI;

  if (dx > 0 && dy < 0) {
    return Math.abs(degrees);
  }

  if (dx > 0 && dy > 0) {
    return 180 - Math.abs(degrees);
  }

  if (dx < 0 && dy > 0) {
    return 180 + Math.abs(degrees);
  }

  if (dx < 0 && dy < 0) {
    return 360 - Math.abs(degrees);
  }

  if (dx === 0 && dy >= 0) {
    return 180 + Math.abs(degrees);
  }

  if (dy === 0 && dx <= 0) {
    return 360 - Math.abs(degrees);
  }

  return degrees;
};

const calcAngle = (pointA, pointC) => {
  const [xA, yA] = pointA.split(".").map(x => parseInt(x));
  const [xC, yC] = pointC.split(".").map(x => parseInt(x));
  return toPolar([xC - xA, yC - yA]);
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_ten.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const rows = data.split("\n");

    const spaceMap = rows.reduce((prev, curr, y) => {
      const row = curr.split("").reduce((acc, space, x) => {
        return { ...acc, [`${x}.${y}`]: space !== empty ? true : false };
      }, {});
      return { ...prev, ...row };
    }, {});

    const asteroids = Object.keys(spaceMap)
      .filter(space => spaceMap[space])
      .reduce((prev, point) => ({ ...prev, [point]: spaceMap[point] }), {});

    const coords = Object.keys(asteroids);

    const links = coords.map((point, i) => {
      const others = coords.filter((_, same) => i !== same);
      return {
        point,
        links: others.reduce((prev, other) => {
          const blockedBy = blockedByObject(asteroids, point, other);
          if (blockedBy) {
            return prev;
          }
          return prev.concat(other);
        }, [])
      };
    });

    const sorted = links
      .slice(0)
      .sort((a, b) => b.links.length - a.links.length);

    const station = sorted[0];

    const others = Object.keys(asteroids).filter(key => key !== station.point);

    const withAngle = others
      .slice(0)
      .map(target => ({
        target,
        angle: calcAngle(station.point, target),
        distance: distance(station.point, target)
      }))
      .reduce((prev, curr) => {
        if (prev[curr.angle]) {
          return {
            ...prev,
            [curr.angle]: [...prev[curr.angle], curr]
              .slice(0)
              .sort((a, b) => a.distance - b.distance)
          };
        }
        return { ...prev, [curr.angle]: [curr] };
      }, {});

    const longest = Math.max(...Object.values(withAngle).map(x => x.length));

    const alignedByAngle = Object.keys(withAngle).sort(
      (a, b) => parseFloat(a) - parseFloat(b)
    );

    const destroy = Array.from({ length: longest }, (_, i) => i).reduce(
      (prev, rotation) => {
        const destroyed = alignedByAngle
          .map(key => withAngle[key][rotation])
          .filter(x => x);

        return [...prev, ...destroyed];
      },
      []
    );

    console.log(destroy[199]);
  }
);
