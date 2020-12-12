const input = await Deno.readTextFile("./input/twelve.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const hands = ["L", "R"] as const;

type Hand = typeof hands[number];

const cardinals = ["N", "S", "W", "E"] as const;

type Cardinal = typeof cardinals[number];

type Instruction = "F" | Cardinal | Hand;

const angles = [0, 90, 180, 270] as const;

type Angle = typeof angles[number];

type Coord = [x: number, y: number];

function isHand(h: Hand | string): h is Hand {
  return h === "L" || h === "R";
}

function isCardinal(h: Cardinal | string): h is Cardinal {
  return h === "N" || h === "S" || h === "W" || h === "E";
}

function isAngle(num: Angle | number): num is Angle {
  return !!angles.find((x) => x === num);
}

const head = <T extends any[]>([head]: [...T]) => head;

const opposite = (hand: Hand): Hand =>
  head(["L", "R"].filter((ans) => ans !== hand).filter(isHand));

const rotateShip = (
  current: Cardinal,
  direction: Hand,
  angle: Angle
): Cardinal => {
  if (angle === 0) return current;
  if (angle === 180)
    return rotateShip(rotateShip(current, direction, 90), direction, 90);

  if (angle === 270)
    return rotateShip(rotateShip(current, direction, 90), direction, 180);

  switch (current) {
    case "S":
      return rotateShip("N", opposite(direction), 90);
    case "W":
      return rotateShip("E", opposite(direction), 90);
    case "N":
      return direction === "L" ? "W" : "E";
    case "E":
      return direction === "L" ? "N" : "S";
  }
};

const cardinalMove = (
  cardinal: Cardinal,
  steps: number,
  ship: [...Coord]
): [...Coord] => {
  const [prevX, prevY] = ship;
  switch (cardinal) {
    case "N":
    case "S":
      const dY = cardinal === "N" ? steps : -steps;
      return [prevX, prevY + dY];
    case "W":
    case "E":
      const dX = cardinal === "E" ? steps : -steps;
      return [prevX + dX, prevY];
  }
};

const rotateWaypoint = (
  direction: Hand,
  angle: Angle,
  waypoint: Coord,
  ship: Coord
): Coord => {
  if (angle === 0) return waypoint;
  if (angle === 180)
    return rotateWaypoint(
      direction,
      90,
      rotateWaypoint(direction, 90, waypoint, ship),
      ship
    );
  if (angle === 270)
    return rotateWaypoint(
      direction,
      180,
      rotateWaypoint(direction, 90, waypoint, ship),
      ship
    );

  const [wX, wY] = waypoint;
  const [prevX, prevY] = ship;

  const [relX, relY] = [wX - prevX, wY - prevY];

  return direction === "L"
    ? [prevX - relY, prevY + relX]
    : rotateWaypoint("L", 270, waypoint, ship);
};

const forwardShip = (
  steps: number,
  [wX, wY]: Coord,
  [prevX, prevY]: Coord
): { ship: Coord; waypoint: Coord } => {
  const [relX, relY] = [wX - prevX, wY - prevY];
  const [nextX, nextY] = [prevX + steps * relX, prevY + steps * relY];
  return {
    ship: [nextX, nextY],
    waypoint: [relX + nextX, relY + nextY]
  };
};

/**
 * Part One
 */

type Entry = { dir: Instruction; steps: Angle | number };

const rows = input.map((row) => {
  const [dir, ...strNum] = row.split("");
  const steps = Number(strNum.join(""));

  return { dir, steps };
});

const [x1, y1] = rows.reduce<[...Coord, Cardinal]>(
  (prev, { dir, steps }) => {
    const [prevX, prevY, facing] = prev;

    switch (dir) {
      case "F":
        return [...cardinalMove(facing, steps, [prevX, prevY]), facing];
      case "L":
      case "R":
        return isAngle(steps)
          ? [prevX, prevY, rotateShip(facing, dir, steps)]
          : prev;
      case "N":
      case "S":
      case "W":
      case "E":
        return [...cardinalMove(dir, steps, [prevX, prevY]), facing];

      default:
        return prev;
    }
  },
  [0, 0, "E"]
);

console.log("Part One:", Math.abs(x1) + Math.abs(y1));

/**
 * Part Two
 */

const {
  ship: [x2, y2]
} = rows.reduce<{ ship: Coord; waypoint: Coord }>(
  (prev, { dir, steps }) => {
    const { waypoint, ship } = prev;

    switch (dir) {
      case "F":
        return forwardShip(steps, waypoint, ship);

      case "L":
      case "R":
        return isAngle(steps)
          ? {
              ...prev,
              waypoint: rotateWaypoint(dir, steps, waypoint, ship)
            }
          : prev;

      case "N":
      case "S":
      case "W":
      case "E":
        return { ...prev, waypoint: cardinalMove(dir, steps, waypoint) };
      default:
        return prev;
    }
  },
  { waypoint: [10, 1], ship: [0, 0] }
);

console.log("Part Two:", Math.abs(x2) + Math.abs(y2));
