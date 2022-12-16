const filename = "16";

type Node = { label: string; rate: number; adj: string[] };

function search(
  current: string,
  grid: Record<string, Node>,
  minute: number,
  cache: Record<string, number>,
  opened: Set<string>
) {
  let localMax = 0;

  const key = [...opened.keys()].sort();

  if (typeof cache[`${minute}.${key}.${current}`] !== "undefined") {
    return cache[`${minute}.${key}.${current}`];
  }

  if (minute <= 0) {
    return 0;
  }

  for (const valve of grid[current].adj) {
    const next = search(valve, grid, minute - 1, cache, opened);

    localMax = Math.max(localMax, next);
  }

  if (!opened.has(current) && grid[current].rate > 0) {
    const branch = new Set(opened);

    branch.add(current);

    const flow = grid[current].rate * (minute - 1);

    for (const valve of grid[current].adj) {
      const next = search(valve, grid, minute - 2, cache, branch);

      localMax = Math.max(localMax, flow + next);
    }
  }

  cache[`${minute}.${key}.${current}`] = localMax;

  return localMax;
}

const withCache = <Fn extends (...args: any[]) => any>(
  fn: Fn,
  memo: (...args: Parameters<Fn>) => string
) => {
  const cache: Record<string, ReturnType<Fn>> = {};

  return (...args: Parameters<Fn>) => {
    const key = memo(...args);
    if (typeof cache[key] !== "undefined") return cache[key];

    cache[key] = fn(...args);

    return cache[key];
  };
};

function ext_search(
  current: string,
  grid: Record<string, Node>,
  minute: number,
  cache: Record<string, number>,
  opened: Set<string>,
  onComplete: typeof search
) {
  let localMax = 0;

  const key = [...opened.keys()].sort();

  if (typeof cache[`${minute}.${key}.${current}`] !== "undefined") {
    return cache[`${minute}.${key}.${current}`];
  }

  if (minute <= 0) {
    return onComplete("AA", grid, 26, {}, opened);
  }

  for (const valve of grid[current].adj) {
    const next = ext_search(valve, grid, minute - 1, cache, opened, onComplete);

    localMax = Math.max(localMax, next);
  }

  if (!opened.has(current) && grid[current].rate > 0) {
    const branch = new Set(opened);

    branch.add(current);

    const flow = grid[current].rate * (minute - 1);

    for (const valve of grid[current].adj) {
      const next = ext_search(
        valve,
        grid,
        minute - 2,
        cache,
        branch,
        onComplete
      );

      localMax = Math.max(localMax, flow + next);
    }
  }

  cache[`${minute}.${key}.${current}`] = localMax;

  return localMax;
}

const solve = async (example = false) => {
  const input = await Deno.readTextFile(
    `./input/${example ? "example" : filename}.in`
  );

  const data = input.split("\n");

  const start = "AA";

  const system = data.map<Node>((row) => {
    const [left, right] = row.split("; ");
    const spec = left.replace("Valve ", "").replace("has flow rate=", "");

    const [label, rateStr] = spec.split(" ");

    const adj = right.replaceAll(",", "").split(" ").slice(4);

    return { label, rate: Number(rateStr), adj, open: false };
  });

  const grid = system.reduce<Record<string, Node>>((prev, node) => {
    prev[node.label] = node;
    return prev;
  }, {});

  /**
   * Part One
   */

  if (example) {
    console.log("Example:");
  }

  console.log("Part one:", search(start, grid, 30, {}, new Set()));

  /**
   * Part Two
   */
  const cachedSearch = withCache(search, (current, __, minute, ___, opened) => {
    const key = [...opened.keys()].sort();

    return `${minute}.${key}.${current}`;
  });

  // This takes ~12 minutes
  // I guess that's NOT enough to escape from the Volcano?
  console.log(
    "Part two:",
    ext_search(start, grid, 26, {}, new Set(), cachedSearch)
  );
};

await solve(true);
console.log("----");
await solve();
