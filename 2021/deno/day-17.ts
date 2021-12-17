const input = await Deno.readTextFile("./input/day-17.in");
// const input = await Deno.readTextFile("./input/example.in");

const target = input
  .replace("target area: ", "")
  .split(", ")
  .map((range) => range.split("=")[1].split("..").map(Number));

const [xRange, yRange] = target;

type Position = { x: number; y: number };
type Velocity = { dx: number; dy: number };

const updatePosition = (position: Position, velocity: Velocity): Position => {
  return {
    x: position.x + velocity.dx,
    y: position.y + velocity.dy
  };
};

const updateVelocity = (velocity: Velocity): Velocity => {
  // drag effect
  const dx = velocity.dx - Math.sign(velocity.dx);
  // gravity
  const dy = velocity.dy - 1;
  return { dx, dy };
};

const inRange = (range: number[], coord: number) => {
  return coord >= range[0] && coord <= range[1];
};

const inTargetArea = (
  xRange: number[],
  yRange: number[],
  position: Position
) => {
  const inYArea = position.y >= yRange[0] && position.y <= yRange[1];
  const inXArea = position.x >= xRange[0] && position.x <= xRange[1];

  return inYArea && inXArea;
};

let minDx = 0;

while (1) {
  if ((minDx * (minDx + 1)) / 2 > xRange[0]) {
    break;
  }
  minDx = minDx + 1;
}

const maxDx = xRange[1];

const initialDy = Math.abs(yRange[0]) - 1;

const maxY = (initialDy * (initialDy + 1)) / 2;

/**
 * Part One
 */
console.log("Part One:", maxY);

/**
 * Part Two
 */

const initial: Set<string> = new Set();

for (let dx = minDx; dx <= maxDx; dx++) {
  for (let dy = yRange[0]; dy <= -yRange[0]; dy++) {
    const init = `${dx}.${dy}`;
    let velocity = { dx, dy };
    let position = { x: 0, y: 0 };

    while (1) {
      if (inTargetArea(xRange, yRange, position)) {
        initial.add(init);

        break;
      }

      if (
        (velocity.dx === 0 && position.x < xRange[0]) ||
        position.x > xRange[1]
      ) {
        // falling down out of the target
        break;
      }

      if (position.y < yRange[0] && velocity.dy < 0) {
        // falling down out of the target
        break;
      }

      position = updatePosition(position, velocity);
      // update speed
      velocity = updateVelocity(velocity);
    }
  }
}

console.log("Part Two:", initial.size);
