const input = await Deno.readTextFile("./input/eleven.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const empty = "L";
const occupied = "#";
const floor = ".";

const directions = ["u", "d", "l", "r", "ur", "ul", "dr", "dl"];
type Direction = typeof directions[number];

type Coord = [x: number, y: number];

type Walker = (direction: Direction, coord: Coord) => Seat | null;

type Seat = {
  next: string;
  value: string;
  simulate({ walker, tolerance }: { walker: Walker; tolerance: number }): void;
  prepare(next: string): void;
  update(): void;
  reset(): void;
};

type Action = "simulate" | "update" | "reset";

interface Grid {
  grid: Seat[][];
  dispatch(action: Exclude<Action, "simulate">): void;
  dispatch(
    action: Exclude<Action, "update" | "reset">,
    payload: { walker: Walker; tolerance: number }
  ): void;
}

const advance = (direction: Direction, [x, y]: Coord): Coord => {
  switch (direction) {
    case "u":
      return [x, y + 1];
    case "d":
      return [x, y - 1];
    case "l":
      return [x - 1, y];
    case "r":
      return [x + 1, y];
    case "ur":
      return [x + 1, y + 1];
    case "ul":
      return [x - 1, y + 1];
    case "dr":
      return [x + 1, y - 1];
    case "dl":
      return [x - 1, y - 1];
    default:
      throw new Error("Invalid direction");
  }
};

const createWalker = (grid: Seat[][], steps = 1): Walker => (
  direction: Direction,
  [_x, _y]: Coord
): Seat | null => {
  let coord: Coord = [_x, _y];
  let ticks = 0;

  while (ticks < steps) {
    coord = advance(direction, coord);
    const [x, y] = coord;

    if (grid?.[y]?.[x]?.value !== floor) {
      return grid?.[y]?.[x] ?? null;
    }
    ticks = ticks + 1;
  }
  return null;
};

const isOccupied = (seat: Seat | null) => seat?.value === occupied;

const createGrid = (raw: string[]): Grid => {
  const grid: Seat[][] = raw.map((row, y) =>
    row.split("").map((cell, x) => {
      const initial = cell;
      const coord: Coord = [x, y];

      return {
        next: initial,
        value: initial,
        simulate({ walker, tolerance }: { walker: Walker; tolerance: number }) {
          const adj = directions.map((dir) => walker(dir, coord));

          switch (this.value) {
            case empty: {
              const free = adj.every((seat) => !isOccupied(seat));

              return free ? this.prepare(occupied) : null;
            }
            case occupied: {
              const crowded = adj.filter(isOccupied).length >= tolerance;

              return crowded ? this.prepare(empty) : null;
            }
            case floor:
            default:
              return;
          }
        },
        prepare(next: string) {
          this.next = next;
        },
        update() {
          this.value = this.next;
        },
        reset() {
          this.value = initial;
          this.next = initial;
        }
      };
    })
  );

  return {
    grid,
    dispatch(action: Action, payload?: { walker: Walker; tolerance: number }) {
      grid.forEach((row) =>
        row.forEach((cell) => {
          if (action === "simulate" && payload) {
            cell?.[action]?.(payload);
          } else if (action === "reset" || action === "update") {
            cell?.[action]?.();
          }
        })
      );
    }
  };
};

const monitor = (grid: Seat[][]) => {
  let prev = "";

  const hasSettled = () => {
    const update = print(grid);
    if (update === prev) return true;
    prev = update;
    return false;
  };

  return { hasSettled };
};

const print = (grid: Seat[][]) =>
  grid.map((row) => row.map((cell) => cell.value).join("")).join("\n");

const getOccupied = (grid: Seat[][]) =>
  grid.reduce(
    (prev, curr) =>
      prev +
      curr.reduce((acc, seat) => (seat.value === occupied ? acc + 1 : acc), 0),
    0
  );

/**
 * Part One
 */

const { grid, dispatch } = createGrid(input);

const sub = monitor(grid);

const shortWalker = createWalker(grid, 1);

while (!sub.hasSettled()) {
  dispatch("simulate", { walker: shortWalker, tolerance: 4 });
  dispatch("update");
}

// 2361
console.log("Part One:", getOccupied(grid), 2361);

/**
 * Part Two
 */

dispatch("reset");

const walker = createWalker(grid, Infinity);

while (!sub.hasSettled()) {
  dispatch("simulate", { walker, tolerance: 5 });
  dispatch("update");
}

console.log("Part Two:", getOccupied(grid), 2119);
