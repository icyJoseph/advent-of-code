const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

type Node = string;
type Edges = Map<Node, number>;

type SlimGraph = Map<Node, Edges>;
type SlimEdge = { from: Node; dest: Node; weight: number };

function cloneGraph(graph: SlimGraph): SlimGraph {
  const clone: SlimGraph = new Map();

  graph.forEach((edges, node) => {
    clone.set(node, new Map(edges));
  });

  return clone;
}

function findEdge(
  from: Node,
  dest: Node,
  graph: SlimGraph
): SlimEdge | null {
  const weight = graph.get(from)?.get(dest);

  if (typeof weight === "undefined") return null;

  return { from, dest, weight };
}

function getEdges(
  from: Node,
  graph: SlimGraph
): SlimEdge[] {
  const edges: SlimEdge[] = [];

  graph.get(from)?.forEach((weight, dest) => {
    edges.push({ from, dest, weight });
  });

  return edges;
}

function mergeNodes(
  keep: Node,
  toss: Node,
  graph: SlimGraph
) {
  getEdges(toss, graph).forEach(({ dest, weight }) => {
    if (dest === keep) return;
    // node that toss points towards
    const destinations = graph.get(dest);

    if (!destinations) throw new Error("Missing dest node");

    // tell the node to point to keep, or update its weight
    destinations.set(
      keep,
      (destinations.get(keep) ?? 0) + weight
    );

    // remove connection back to toss
    destinations.delete(toss);

    // update entry on the graph
    graph.set(dest, destinations);

    // get current state of keep
    const keepEdges = graph.get(keep);

    if (!keepEdges) throw new Error("Missing keep node");

    // tells keep to point to the node, or update its weight
    keepEdges.set(
      dest,
      (keepEdges.get(dest) ?? 0) + weight
    );
    // update keep entry on the graph
    graph.set(keep, keepEdges);

    graph.get(toss)?.delete(dest);
  });

  graph.get(keep)?.delete(toss);
  graph.get(toss)?.delete(keep);

  console.assert(
    graph.get(toss)?.size === 0,
    "Did not merge toss into keep correctly"
  );

  // drop toss
  graph.delete(toss);
}

const sum = (a: number, b: number) => a + b;

function maxAdj(graph: SlimGraph) {
  const start = graph.keys().next().value;

  let [beforeLast, last]: [string, string] = [start, start];
  let weight = -Infinity;

  const candidates = new Set(Array.from(graph.keys()));

  const blob = new Set([start]);
  const nearby = new Set(
    getEdges(start, graph).map(({ dest }) => dest)
  );

  candidates.delete(start);

  while (candidates.size) {
    let next: string | null = null;
    let max = 0;

    for (const candidate of nearby) {
      const localWeight = getEdges(candidate, graph)
        .filter((edge) => blob.has(edge.dest))
        .map((edge) => edge.weight)
        .reduce(sum, 0);

      if (localWeight > max) {
        next = candidate;
        max = localWeight;
      }
    }

    if (!next)
      throw new Error("Failed to find a next node");

    candidates.delete(next);
    weight = max;

    nearby.delete(next);
    blob.add(next);

    [beforeLast, last] = [last, next];

    getEdges(next, graph).forEach((edge) => {
      if (blob.has(edge.dest)) return;
      nearby.add(edge.dest);
    });
  }

  return [[beforeLast, last], weight] as const;
}

function stoerWagnerMinCut(graph: SlimGraph) {
  const currentPartition = new Set<string>();

  let currentBestPartition: Set<string> = new Set();

  let currentBest: ReturnType<typeof maxAdj> | null = null;

  while (graph.size > 1) {
    const cutOfThePhase = maxAdj(graph);

    if (
      currentBest === null ||
      cutOfThePhase[1] < currentBest[1]
    ) {
      currentBest = cutOfThePhase;

      currentBestPartition = new Set(currentPartition);

      currentBestPartition.add(cutOfThePhase[0][1]);
    }

    currentPartition.add(cutOfThePhase[0][1]);

    mergeNodes(
      cutOfThePhase[0][0],
      cutOfThePhase[0][1],
      graph
    );
  }

  return currentBestPartition;
}

function buildSlimPartition(
  partition: Set<Node>,
  original: SlimGraph
) {
  const nodes = Array.from(partition);

  const group = new Set();

  nodes.forEach((current, index, src) => {
    const others = src.slice(index);

    others.forEach((other) => {
      const edge = findEdge(current, other, original);

      if (!edge) return;

      group.add(current);
      group.add(other);
    });
  });

  return group;
}

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */
  const slimGraph: SlimGraph = new Map();

  input.split("\n").forEach((row) => {
    const [node, targets] = row.split(": ");

    const forward =
      slimGraph.get(node) ?? new Map<Node, number>();

    slimGraph.set(node, forward);

    targets.split(" ").forEach((dest) => {
      forward.set(dest, 1);

      const back =
        slimGraph.get(dest) ?? new Map<Node, number>();

      back.set(node, 1);

      slimGraph.set(dest, back);
    });

    slimGraph.set(node, forward);
  });

  const original = cloneGraph(slimGraph);

  const bestCutPartition = stoerWagnerMinCut(slimGraph);

  const partition = buildSlimPartition(
    bestCutPartition,
    original
  );

  const totalNodeSize = original.size;

  console.log(
    "Part 1:",
    partition.size * (totalNodeSize - partition.size)
  );
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
