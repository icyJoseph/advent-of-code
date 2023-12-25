const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

const balancedKey = (from: string, node: string) =>
  [from, node].toSorted().join(" -> ");

function bfs<T>({
  start,
  end,
  adj,
  totals,
}: {
  start: string;
  end: string;
  adj: Map<string, string[]>;
  totals: Map<string, number>;
}) {
  const q: Array<{ label: string; path: string[] }> = [];
  const visited = new Set<string>();

  q.push({ label: start, path: [start] });

  let path: string[] = [];

  while (true) {
    const current = q.shift();

    if (current == null) break;

    const around = adj.get(current.label);
    // console.log(around);
    if (!around) continue;

    for (const vec of around) {
      if (vec === end) {
        // console.log("END", current, vec, end);
        path = [...current.path, vec];
        break;
      }

      if (visited.has(vec)) continue;

      visited.add(vec);

      q.push({ label: vec, path: [...current.path, vec] });
    }
  }

  path.forEach((node, index, src) => {
    if (index === src.length - 1) return;

    const key = balancedKey(node, src[index + 1]);

    totals.set(key, (totals.get(key) ?? 0) + 1);
  });
}

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const map = new Map<string, string[]>();

  const data = input.split("\n").map((row) => {
    const [from, rhs] = row.split(": ");

    const to = rhs.split(" ").map((r) => r.trim());

    return { from, to };
  });

  data.forEach(({ from, to }) => {
    to.forEach((node) => {
      const currentFrom = map.get(from) ?? [];
      map.set(from, [...currentFrom, node]);

      const currentNode = map.get(node) ?? [];
      map.set(node, [...currentNode, from]);
    });
  });

  let x = 0;
  const getId = () => x++;

  // x->y pair to numeric id
  const edgeIds = new Map<string, number>();
  // numeric id to x->y pair
  const edgeIdLookup = new Map<number, string>();

  const graph: string[] = ["digraph {", 'node[label=""];'];

  map.forEach((to, from) => {
    to.forEach((n) => {
      const key = balancedKey(from, n);

      if (!edgeIds.has(key)) {
        const keyId = getId();
        edgeIds.set(key, keyId);
        edgeIdLookup.set(keyId, key);
      }

      const label = edgeIds.get(key);

      graph.push(
        `${from} -> ${n} [dir=none] [label="${label}"];`
      );
    });
  });

  graph.push("}");

  await Deno.writeFile(
    isExample ? "./25-example.dot" : "./25.dot",
    new TextEncoder().encode(graph.join("\n"))
  );

  const total = map.size;

  const cutEdges = (
    edges: number[],
    adj: Map<string, string[]>
  ) => {
    const [firstEdge] = edges;

    const start = edgeIdLookup
      .get(firstEdge)
      ?.split(" -> ")[0];

    const q = [start];
    const seen = new Set();

    while (true) {
      const next = q.pop();

      if (!next) break;

      const around = adj.get(next);

      if (!around) continue;

      for (const n of around) {
        const key = balancedKey(next, n);

        if (edges.find((e) => e === edgeIds.get(key))) {
          continue;
        }

        if (seen.has(n)) {
          continue;
        }

        seen.add(n);
        q.push(n);
      }
    }

    return seen.size * (total - seen.size);
  };

  // manual observation of the .svg file created from
  // dot -Ksfdp -T svg 25-example.dot > 25-example.svg or
  // dot -Ksfdp -T svg 25.dot > 25.svg
  // const edges = isExample ? [22, 29, 2] : [1433, 241, 551];

  if (isExample) {
    return console.log(
      "Example part 1:",
      cutEdges([22, 29, 2], map)
    );
  }

  const totals = new Map<string, number>();

  const nodes = Array.from(map.keys());

  nodes.forEach((node, index, src) => {
    bfs({
      start: node,
      end:
        index === src.length - 1 ? src[0] : src[index + 1],
      adj: map,
      totals,
    });
  });

  const highTraffic = [
    ...new Set(
      Array.from(totals.entries())
        .toSorted((lhs, rhs) => rhs[1] - lhs[1])
        .slice(0, 3)
        .map(([edge]) => edgeIds.get(edge))
        .flat(1)
        .filter(<T>(v: T | undefined): v is T => v != null)
    ),
  ];

  return console.log("Part 1:", cutEdges(highTraffic, map));
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
