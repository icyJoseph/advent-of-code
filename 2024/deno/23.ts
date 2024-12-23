const isDebug = Deno.args.includes("--debug");
const log = console.log;

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = (input: string, ans: Answer) => {
  const lines = input.split("\n").map((row) => {
    const [left, right] = row.split("-");

    return { left, right };
  });

  const graph = lines.reduce((acc, curr) => {
    const c = acc.get(curr.left) ?? new Set();
    const d = acc.get(curr.right) ?? new Set();

    c?.add(curr.right);
    acc.set(curr.left, c);
    d?.add(curr.left);
    acc.set(curr.right, d);

    return acc;
  }, new Map<string, Set<string>>());

  /**
   * Part One
   */

  const networks = new Set<string>();

  graph.keys().forEach((first) => {
    const adj = graph.get(first);

    if (!adj) return;

    for (const second of adj) {
      const adj2 = graph.get(second);

      if (!adj2) continue;

      for (const third of adj2) {
        const adj3 = graph.get(third);

        if (!adj3) continue;

        for (const fourth of adj3) {
          if (fourth === first) {
            if (first !== second && second !== third && first !== third)
              networks.add([first, second, third].sort().join("->"));
          }
        }
      }
    }
  });

  ans.p1 = [...networks].filter((row) =>
    row.split("->").some((w) => w.startsWith("t"))
  ).length;

  /**
   * Part Two
   */

  let largest = "";

  graph.keys().forEach((first) => {
    const q: string[] = [];
    const visited = new Set<string>();
    const members = new Set<string>();

    q.push(first);

    while (true) {
      const current = q.shift();

      if (!current) break;
      if (visited.has(current)) continue;

      // should we add this current to network
      const adj = graph.get(current);
      if (!adj) continue;

      // only if its connected to every member of the network
      const connected = [...members].every((node) => {
        return adj.has(node);
      });

      visited.add(current);

      if (!connected) continue;

      members.add(current);

      for (const next of adj) {
        q.push(next);
      }
    }

    const lan = [...members].sort().join(",");

    if (lan.length > largest.length) {
      largest = lan;
    }
  });

  ans.p2 = largest;
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  log("-- Day", filename, "--");

  const path = isExample ? "./input/example.in" : `./input/${filename}.in`;
  const input = await Deno.readTextFile(path);

  const ans: Answer = { p1: 0, p2: 0 };

  if (isExample) log("Example");

  solve(input, ans);

  console.log("Part 1:", ans.p1);
  console.log("Part 2:", ans.p2);

  log("-- Done --");
}

type Answer = { p1: any; p2: any };

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);
