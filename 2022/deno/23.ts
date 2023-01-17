const [__filename_ext] = new URL("", import.meta.url).pathname
  .split("/")
  .slice(-1);
const filename = __filename_ext.replace(".ts", "");

const asKey = ({ x, y }: { x: number; y: number }) => `${x}.${y}`;

type Coord = { x: number; y: number };

const nbors = ({ x, y }: Coord) => {
  // dx,dy
  const frame = {
    N: [0, -1],
    S: [0, 1],
    W: [-1, 0],
    E: [1, 0],

    NW: [-1, -1],
    NE: [1, -1],

    SW: [-1, 1],
    SE: [1, 1],
  } as const;

  type Frame = typeof frame;

  return Object.entries(frame).reduce((acc, [dir, [dx, dy]]) => {
    acc[dir as keyof Frame] = asKey({ x: x + dx, y: y + dy });

    return acc;
  }, {} as Record<keyof Frame, string>);
};

type Cell = {
  key: string;
  pos: Coord;
  value: string;
  adj: ReturnType<typeof nbors>;
};

const isEmpty = (c: Cell | undefined): c is Cell => typeof c === "undefined";
const isTaken = (c: Cell | undefined): c is Cell => typeof c !== "undefined";

const solve = async (pathname: string) => {
  const input = await Deno.readTextFile(pathname);

  const grid = input.split("\n").map((row) => row.split(""));

  const graph = grid.reduce<Record<string, Cell>>((acc, row, y) => {
    row.forEach((value, x) => {
      if (value !== "#") return;
      // strictly never keep track of anything but elves
      const key = asKey({ x, y });
      acc[key] = { key, pos: { x, y }, value, adj: nbors({ x, y }) };
    });

    return acc;
  }, {});

  let rounds = 1;

  let cycle = 0;

  while (true) {
    // run simulation

    // first part check nbors
    // const proposal: Array<Cell & { next: Coord }> = [];
    const proposal: Record<string, Cell & { next: Coord; skip: boolean }> = {};

    Object.entries(graph).forEach(([_, cell]) => {
      const nborsPos = Object.values(cell.adj);

      const emptyAround = nborsPos.every((key) => {
        const curr = graph[key];

        return isEmpty(curr);
      });

      if (emptyAround) return;

      const Nof = graph[cell.adj.N];
      const NEof = graph[cell.adj.NE];
      const NWof = graph[cell.adj.NW];

      const Sof = graph[cell.adj.S];
      const SEof = graph[cell.adj.SE];
      const SWof = graph[cell.adj.SW];

      const Wof = graph[cell.adj.W];

      const Eof = graph[cell.adj.E];

      const north = () => {
        if ([Nof, NEof, NWof].some(isTaken)) return 0;

        const next = { x: cell.pos.x, y: cell.pos.y - 1 };

        const key = asKey(next);
        const shouldSkip = Boolean(proposal[key]);

        proposal[key] = {
          ...cell,
          next,
          skip: shouldSkip,
        };

        return true;
      };

      const south = () => {
        if ([Sof, SEof, SWof].some(isTaken)) return 0;

        const next = { x: cell.pos.x, y: cell.pos.y + 1 };

        const key = asKey(next);
        const shouldSkip = Boolean(proposal[key]);

        proposal[key] = {
          ...cell,
          next,
          skip: shouldSkip,
        };

        return true;
      };

      const west = () => {
        if ([Wof, NWof, SWof].some(isTaken)) return 0;

        const next = { x: cell.pos.x - 1, y: cell.pos.y };

        const key = asKey(next);
        const shouldSkip = Boolean(proposal[key]);

        proposal[key] = {
          ...cell,
          next,
          skip: shouldSkip,
        };

        return true;
      };
      const east = () => {
        if ([Eof, NEof, SEof].some(isTaken)) return 0;

        const next = { x: cell.pos.x + 1, y: cell.pos.y };
        const key = asKey(next);
        const shouldSkip = Boolean(proposal[key]);

        proposal[key] = {
          ...cell,
          next,
          skip: shouldSkip,
        };

        return true;
      };

      const options = [north, south, west, east];

      const execution = [...options.slice(cycle), ...options.slice(0, cycle)];

      for (const test of execution) {
        if (test()) {
          break;
        }
      }
    });

    // second half
    const moved = Object.values(proposal).reduce((acc, self) => {
      if (self.skip) return acc;

      delete graph[self.key];

      const key = asKey(self.next);
      graph[key] = { ...self, pos: self.next, adj: nbors(self.next), key };

      return acc + 1;
    }, 0);

    if (moved === 0) {
      /**
       * Part Two
       */
      console.log("Part two:", rounds);
      break;
    }

    if (rounds === 10) {
      const elves = Object.values(graph);
      const elvesX = elves.map((elf) => elf.pos.x).sort((a, b) => a - b);
      const elvesY = elves.map((elf) => elf.pos.y).sort((a, b) => a - b);

      const [lowerX] = elvesX;
      const [lowerY] = elvesY;

      const [upperX] = elvesX.slice(-1);
      const [upperY] = elvesY.slice(-1);

      const area = (1 + upperY - lowerY) * (1 + upperX - lowerX);

      /**
       * Part One
       */
      console.log("Part one:", area - elves.length);
    }

    cycle = (cycle + 1) % 4;
    rounds += 1;
  }
};

if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/${filename}.example.in`);
  console.log("---");
}

await solve(`./input/${filename}.in`);
