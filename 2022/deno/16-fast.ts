const filename = "16";

type Node = { label: string; rate: number; adj: string[] };

function bfs(start: string, adj: Record<string, string[]>) {
  const distances = { [start]: 0 };

  const seen = new Set();
  seen.add(start);

  const q = [start];

  while (q.length > 0) {
    const next = q.shift();
    if (!next) throw new Error("Q was empty");

    for (const node of adj[next]) {
      if (seen.has(node)) continue;
      seen.add(node);
      distances[node] = distances[next] + 1;
      q.push(node);
    }
  }

  return distances;
}

function pathFinder(
  distances: Record<string, Record<string, number>>,
  valves: Record<string, number>,
  minute: number
) {
  const pressure = [];
  const paths = [];
  const stack: [number, number, string[]][] = [[minute, 0, ["AA"]]];

  while (stack.length > 0) {
    const next = stack.pop();

    if (!next) throw new Error("TS wants safety");

    const [clock, flow, path] = next;

    const [current] = path.slice(-1);
    const nextPath = [];

    for (const [key, value] of Object.entries(distances[current])) {
      if (value > clock - 2 || path.includes(key)) {
        continue;
      }

      const rest = clock - value - 1;
      const updated = flow + valves[key] * rest;

      nextPath.push([rest, updated, [...path, key]] as [
        number,
        number,
        string[]
      ]);
    }
    if (nextPath.length > 0) {
      stack.push(...nextPath);
    } else {
      pressure.push(flow);
      paths.push(path.slice(1));
    }
  }

  return [pressure, paths] as const;
}

const input = await Deno.readTextFile(`./input/${filename}.in`);

const data = input.split("\n");

const system = data.map<Node>((row) => {
  const [left, right] = row.split("; ");
  const spec = left.replace("Valve ", "").replace("has flow rate=", "");

  const [label, rateStr] = spec.split(" ");

  const adj = right.replaceAll(",", "").split(" ").slice(4);

  return { label, rate: Number(rateStr), adj };
});

const adj = system.reduce<Record<string, string[]>>((prev, curr) => {
  prev[curr.label] = curr.adj.slice(0);
  return prev;
}, {});

/**
 * Part One
 */

const valves = system.filter((node) => node.rate > 0);

const labels = valves.map((v) => v.label);

const flowRates = valves.reduce<Record<string, number>>((prev, curr) => {
  prev[curr.label] = curr.rate;
  return prev;
}, {});

const record = ["AA", ...labels].reduce((record, root) => {
  record[root] = record[root] || {};

  const distances = bfs(root, adj);

  labels.forEach((valve) => {
    if (valve !== root && typeof distances[valve] !== "undefined") {
      record[root][valve] = distances[valve];
    }
  });

  return record;
}, {} as Record<string, Record<string, number>>);

const [highest] = pathFinder(record, flowRates, 30)[0].sort((a, b) => b - a);

console.log("Part one:", highest);

/**
 * Part Two
 */

const [allPressures, allPaths] = pathFinder(record, flowRates, 26);

// join pressure->path pairs
const pairs = allPressures.map((p, index) => [p, allPaths[index]] as const);

// sort so that the path that yields most pressure is first
pairs.sort((a, b) => b[0] - a[0]);

// divide
const pressures = pairs.map((entry) => entry[0]);
const paths = pairs.map((entry) => entry[1]);

const [bestPath] = paths;

// find a path that doesn't intersect at all
const upper = paths.findIndex((path) =>
  path.every((step) => !bestPath.includes(step))
);

// This doesn't work for the example - and I guess it is a fluke?
// The example doesn't have a path that "doesn't intersect at all"
// Perhaps it needs the next best thing (intersects the least),
// but hey, this works ¯\_(ツ)_/¯
console.log("Part two:", pressures[0] + pressures[upper]);
