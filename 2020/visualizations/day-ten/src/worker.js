const empty = "L";
const occupied = "#";
const floor = ".";

const directions = ["u", "d", "l", "r", "ur", "ul", "dr", "dl"];

const advance = (direction, [x, y]) => {
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

const createWalker = (grid, steps = 1) => (direction, [_x, _y]) => {
  let coord = [_x, _y];
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

const isOccupied = (seat) => seat?.value === occupied;

const createGrid = (raw) => {
  const grid = raw.map((row, y) =>
    row.split("").map((cell, x) => {
      const initial = cell;
      const coord = [x, y];

      return {
        next: initial,
        value: initial,
        simulate({ walker, tolerance }) {
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
        prepare(next) {
          this.next = next;
        },
        update() {
          this.value = this.next;
        }
      };
    })
  );

  return {
    grid,
    dispatch(action, payload) {
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

const monitor = (grid) => {
  let prev = "";

  const hasSettled = () => {
    const update = print(grid);
    if (update === prev) return true;
    prev = update;
    return false;
  };

  return { hasSettled };
};

const print = (grid) =>
  grid.map((row) => row.map((cell) => cell.value).join("")).join("\n");

export function runner(raw) {
  const { grid, dispatch } = createGrid(raw);
  const walker = createWalker(grid, Infinity);
  const sub = monitor(grid);

  while (!sub.hasSettled()) {
    dispatch("simulate", { walker, tolerance: 5 });
    dispatch("update");
    postMessage({ type: "grid", grid: print(grid) });
  }
  postMessage({ type: "done" });
}
