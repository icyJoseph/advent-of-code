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

function path_finder(
  start: string,
  adj: Record<string, string[]>,
  dict: Record<string, Grid>,
  allowed?: string
) {
  const sq: Set<string> = new Set();
  const snapshots: Record<string, number> = {};
  const q: string[] = [];

  const paths: Set<string> = new Set([start]);

  q.push(start);
  sq.add(start);

  while (true) {
    const snapshot = q.join(",");

    if (snapshots[snapshot] > 4) {
      break;
    }

    snapshots[snapshot] = (snapshots[snapshot] || 0) + 1;

    const current = q.shift();

    if (current == null) break;

    sq.delete(current);

    for (const vec of adj[current]) {
      if (vec === "start") continue;

      paths.forEach((path) => {
        if (path.endsWith("end")) return;
        if (!path.endsWith(current)) return;

        const newPath = `${path},${vec}`;

        if (vec === allowed) {
          const count = path.split(",").filter((c) => c === vec).length;
          if (count < 2) paths.add(newPath);
        } else {
          const shouldAdd = dict[vec].small
            ? !path.split(",").includes(vec)
            : true;

          if (shouldAdd) paths.add(newPath);
        }
      });

      if (vec !== "end") {
        if (sq.has(vec)) continue;
        q.push(vec);
        sq.add(vec);
      }
    }
  }

  return [...paths].filter((n) => n.endsWith("end"));
}

const path = path_finder("start", adj, dict);

/**
 * Part One
 */
console.log("Part One:", path.length);

/**
 * Part Two
 */

const small = grid.filter((node) => node.small);

const total = new Set();

for (const { node } of small) {
  if (node === "start" || node === "end") continue;

  console.log("Processing:", node);

  const path = path_finder("start", adj, dict, node);

  path.forEach((p) => total.add(p));
}
console.log("Part Two:", total.size);
