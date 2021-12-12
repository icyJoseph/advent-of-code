const input = await Deno.readTextFile("./input/day-12.in");
// const input = await Deno.readTextFile("./input/example.in");

const rows = input.split("\n");

const nodeNames = [...new Set(rows.map((path) => path.split("-")).flat(1))];

const grid: Grid[] = nodeNames.map((node) => {
  const connections = rows
    .map((path) => path.split("-"))
    .filter((row) => row.includes(node))
    .flat(1)
    .filter((n) => n !== node);

  return { node, connections, small: node.toLowerCase() === node };
});

type Grid = {
  node: string;
  connections: string[];
  small: boolean;
};

const adj: Record<string, string[]> = grid.reduce(
  (prev, curr) => ({ ...prev, [curr.node]: curr.connections }),
  {}
);

const dict: Record<string, Grid> = grid.reduce(
  (prev, curr) => ({ ...prev, [curr.node]: curr }),
  {}
);

function bfs(
  start: string,
  adj: Record<string, string[]>,
  dict: Record<string, Grid>
) {
  const q: string[] = [];

  const distance: Set<string> = new Set([start]);

  q.push(start);

  const totals = [];

  while (true) {
    const current = q.shift();

    if (current == null) break;

    for (const vec of adj[current]) {
      if (vec === "start") continue;

      const paths = [...distance.values()]
        .filter((d) => d.endsWith(current))
        .filter((d) => !d.endsWith("end"));

      const newPaths = paths.filter((path) =>
        dict[vec].small ? !path.split(",").includes(vec) : true
      );

      newPaths
        .map((d) => `${d},${vec}`)
        .forEach((d) => {
          distance.add(d);
        });

      const endPaths = [...distance].filter((n) => n.endsWith("end"));

      totals.push(endPaths.length);

      if (totals.length > 1000) {
        if (totals.slice(-100).every((n) => n === endPaths.length)) {
          break;
        }
      }

      if (vec !== "end" && vec !== current) {
        q.push(vec);
      }
    }
  }

  return [...distance].filter((n) => n.endsWith("end"));
}

const path = bfs("start", adj, dict);

/**
 * Part One
 */
console.log("Part One:", path.length);

/**
 * Part Two
 */

function bfs_mod(
  start: string,
  adj: Record<string, string[]>,
  dict: Record<string, Grid>,
  allowed: string
) {
  const q: string[] = [];

  const distance: Set<string> = new Set([start]);

  q.push(start);

  const totals = [];

  while (true) {
    const current = q.shift();

    if (current == null) break;

    for (const vec of adj[current]) {
      if (vec === "start") continue;

      const paths = [...distance.values()]
        .filter((d) => d.endsWith(current))
        .filter((d) => !d.endsWith("end"));

      const newPaths = paths.filter((path) => {
        if (vec === allowed) {
          const count = path.split(",").filter((c) => c === vec).length;
          return count < 2;
        } else {
          return dict[vec].small ? !path.split(",").includes(vec) : true;
        }
      });

      newPaths
        .map((d) => `${d},${vec}`)
        .forEach((d) => {
          distance.add(d);
        });

      const endPaths = [...distance].filter((n) => n.endsWith("end"));

      totals.push(endPaths.length);

      if (totals.length > 1000) {
        if (totals.slice(-1000).every((n) => n === endPaths.length)) {
          break;
        }
      }

      if (vec !== "end") {
        q.push(vec);
      }
    }
  }

  return [...distance].filter((n) => n.endsWith("end"));
}

const small = grid.filter((node) => node.small);

const total = new Set();

let it = 0;
for (const node of small) {
  console.log(node, it, small.length);

  const path = bfs_mod("start", adj, dict, node.node);

  path.forEach((p) => total.add(p));

  it += 1;
}
console.log("Part Two:", total.size);
