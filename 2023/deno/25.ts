const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

type Edge = {
  label: string;
  weight: number;
};

const createEdgeLabel = (from: string, to: string) => {
  return [from, to].toSorted().join(" <-> ");
};

const createEdge = (
  from: string,
  to: string,
  weight = 1
): Edge => {
  const label = createEdgeLabel(from, to);
  return { label, weight };
};

class Graph {
  constructor(
    public nodes: Set<string>,
    public edges: Map<string, Edge>
  ) {}

  clone() {
    const nodes = new Set(this.nodes);
    const edges = new Map<string, Edge>();

    this.edges.forEach((edge, label) => {
      edges.set(label, { ...edge });
    });

    return new Graph(nodes, edges);
  }

  findEdge(from: string, to: string) {
    const label = createEdgeLabel(from, to);

    return this.edges.get(label);
  }

  cache: Map<string, Array<Edge & { dest: string }>> =
    new Map();

  getEdges(from: string) {
    const cached = this.cache.get(from);
    if (cached) return cached;

    const edges = [...this.edges.values()]
      .filter((edge) => edge.label.includes(from))
      .map((edge) => ({
        ...edge,
        dest: edge.label
          .replace(from, "")
          .replace(" <-> ", ""),
      }));

    this.cache.set(from, edges);

    return edges;
  }

  mergeVertices(keep: string, toss: string) {
    this.cache = new Map();

    const targetEdges = [...this.edges.keys()].filter(
      (edge) => edge.includes(toss)
    );

    if (targetEdges.length === 0) return;

    const openEdges = targetEdges
      .map((edge) => this.edges.get(edge))
      .filter(<T>(edge: T | undefined): edge is T => !!edge)
      .map(({ label, weight }) => ({
        weight,
        dest: label.replace(toss, "").replace(" <-> ", ""),
      }));

    const closedEdges = openEdges
      .filter(({ dest }) => dest !== keep)
      .map(({ dest, weight }) => {
        return createEdge(dest, keep, weight);
      });

    const edgeMap = new Map<string, number>();

    const unchangedEdges = [...this.edges.keys()]
      .filter((edge) => !edge.includes(toss))
      .map((edge) => this.edges.get(edge))
      .filter(
        <T>(edge: T | undefined): edge is T => !!edge
      );

    unchangedEdges.forEach(({ label, weight }) => {
      edgeMap.set(label, weight);
    });

    closedEdges.forEach(({ label, weight }) => {
      const current = edgeMap.get(label) ?? 0;

      edgeMap.set(label, current + weight);
    });

    const newEdges = new Map();

    edgeMap.forEach((weight, label) => {
      newEdges.set(label, { label, weight });
    });

    this.edges = newEdges;
    this.nodes.delete(toss);
  }
}

const sum = (a: number, b: number) => a + b;

function maxAdj(graph: Graph) {
  const start = graph.nodes.keys().next().value;

  let [beforeLast, last]: [string, string] = [start, start];
  let weight = -Infinity;

  const candidates = new Set<string>(
    Array.from(graph.nodes.keys())
  );

  const blob = new Set([start]);
  const nearby = new Set(
    graph.getEdges(start).map(({ dest }) => dest)
  );

  candidates.delete(start);

  while (candidates.size) {
    let next: string | null = null;
    let max = 0;

    for (const candidate of nearby) {
      const localWeight = graph
        .getEdges(candidate)
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

    graph.getEdges(next).forEach((edge) => {
      if (blob.has(edge.dest)) return;
      nearby.add(edge.dest);
    });
  }

  return [[beforeLast, last], weight] as const;
}

// Stoer Wagner
function findMinCut(graph: Graph) {
  console.log(
    "nodes:",
    graph.nodes.size,
    "edges:",
    graph.edges.size
  );

  const currentPartition = new Set<string>();

  let currentBestPartition: Set<string> = new Set();

  let currentBest: ReturnType<typeof maxAdj> | null = null;

  while (graph.nodes.size > 1) {
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

    graph.mergeVertices(
      cutOfThePhase[0][0],
      cutOfThePhase[0][1]
    );
  }

  return currentBestPartition;
}

const buildPartition = (
  partition: Set<string>,
  graph: Graph
) => {
  const nodes = Array.from(partition);

  const group = new Set();

  nodes.forEach((current, index, src) => {
    const others = src.slice(index);

    others.forEach((other) => {
      const edge = graph.findEdge(current, other);

      if (!edge) return;

      group.add(current);
      group.add(other);
    });
  });

  return group;
};

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const nodes = new Set<string>();
  const edges = new Map<string, Edge>();

  input.split("\n").forEach((row) => {
    const [node, targets] = row.split(": ");

    nodes.add(node);

    targets.split(" ").forEach((other) => {
      const edge = createEdge(node, other);
      edges.set(edge.label, edge);
      nodes.add(other);
    });
  });

  const totalNodeSize = nodes.size;

  const jointGraph = new Graph(nodes, edges);

  const originalGraph = jointGraph.clone();

  const partition = buildPartition(
    findMinCut(jointGraph),
    originalGraph
  );

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
