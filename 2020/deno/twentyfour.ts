const input = await Deno.readTextFile("./input/twentyfour.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const peekable = (chars: string) => {
  let i = 0;
  return {
    next() {
      let value = chars[i] ?? null;
      i = i + 1;
      return value;
    },
    peek() {
      return chars[i] ?? null;
    }
  };
};

const hexVecs = [
  [-2, 0],
  [2, 0],
  [-1, 1],
  [1, 1],
  [1, -1],
  [-1, -1]
];

type Tile = {
  flip: () => void;
  getIsPending: () => boolean;
  getValue: () => string;
  update: () => void;
  simulate: (directions: number[][]) => void;
};

const createFrom = (tileNodes: Map<string, Tile>) => (
  _initial: string,
  { x, y }: { x: number; y: number },
  pending = false
): Tile => {
  let value = _initial;
  let next = _initial;
  const coords = { x, y };
  let isPending = pending;

  const getNeighbors = (directions: number[][]) =>
    directions.map(([dx, dy]) => {
      const [nx, ny] = [x + dx, y + dy];
      const key = [nx, ny].join(".");
      let cell = tileNodes.get(key);

      if (!cell) {
        cell = node("white", { x: nx, y: ny }, true);
        tileNodes.set(key, cell);
      }

      return cell;
    });

  const simulate = (directions: number[][]) => {
    const around = getNeighbors(directions);

    const activeAround = around
      .filter((n) => n)
      .filter((cell) => cell.getValue() === "black");

    if (getValue() === "black") {
      if (activeAround.length === 0 || activeAround.length > 2) {
        prepare("white");
      }
    } else {
      if (activeAround.length === 2) {
        prepare("black");
      }
    }
  };

  const getValue = () => value;
  const getIsPending = () => isPending;

  const prepare = (_next: string) => {
    next = _next;
  };
  const update = () => {
    value = next;
    isPending = false;
  };

  const flip = () => {
    value = value === "white" ? "black" : "white";
    next = value;
  };

  return {
    flip,
    getIsPending,
    getValue,
    update,
    simulate
  };
};

/**
 * Part One
 */

const paths = input
  .map(peekable)
  .map((path) => {
    const dirs = [];

    let next = path.next();

    while (next) {
      let peek = path.peek();
      if (next === "n" || next === "s") {
        dirs.push(`${next}${peek}`);
        path.next();
      } else {
        dirs.push(next);
      }
      next = path.next();
    }

    return dirs;
  })
  .map((curr) => {
    return curr.reduce(
      (acc, dir) => {
        const [pX, pY] = acc;
        switch (dir) {
          case "nw":
            return [pX - 1, pY + 1];
          case "ne":
            return [pX + 1, pY + 1];
          case "sw":
            return [pX - 1, pY - 1];
          case "se":
            return [pX + 1, pY - 1];
          case "w":
            return [pX - 2, pY];
          case "e":
            return [pX + 2, pY];
          default:
            throw new Error(`Bad direction ${dir}`);
        }
      },
      [0, 0]
    );
  });

const tiles = new Map();
const node = createFrom(tiles);

for (const [x, y] of paths) {
  const key = `${x}.${y}`;

  if (tiles.has(key)) {
    tiles.get(key).flip();
  } else {
    // const newTile = node("white", { x, y });
    // newTile.flip(); // or just create it black
    tiles.set(key, node("black", { x, y }));
  }
}

console.log(
  "Part One:",
  [...tiles.values()].filter((x) => x.getValue() === "black").length
);

/**
 * Part Two
 */

let cycle = 0;
let maxCycles = 100;

while (1) {
  cycle = cycle + 1;

  [...tiles.values()].forEach((cell) => cell.simulate(hexVecs));

  [...tiles.values()]
    .filter((cell) => cell.getIsPending())
    .forEach((cell) => cell.simulate(hexVecs));

  [...tiles.values()].forEach((cell) => cell.update());

  if (cycle === maxCycles) {
    break;
  }
}

console.log(
  "Part Two:",
  [...tiles.values()].filter((x) => x.getValue() === "black").length
);
