const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

/**
 * Helpers
 */

function gcd(a: number, b: number) {
  if (!b) return b === 0 ? a : NaN;
  return gcd(b, a % b);
}

function lcm(a: number, b: number) {
  return (a / gcd(a, b)) * b;
}

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  type Node = { node: string; L: string; R: string };

  const [instructions, nodes] = input.split("\n\n");

  const LRNodes = new Map(
    nodes.split("\n").map<[string, Node]>((row) => {
      const [node, L, R] = row
        .replaceAll(/(=.|\(|\)|,)/g, "")
        .split(" ");

      return [node, { node, L, R }];
    })
  );

  const directions = instructions.split("").map((dir) => {
    // humor TS
    if (dir !== "L" && dir !== "R") throw new Error(dir);

    return dir;
  });

  /**
   * Part One
   */

  const p1 = () => {
    let current = "AAA";

    let pointer = 0;

    while (current !== "ZZZ") {
      const inst = LRNodes.get(current);

      if (typeof inst === "undefined") {
        console.log("%s not found", current);
        return pointer;
      }

      const path = directions[pointer % directions.length];

      current = inst[path];

      pointer = pointer + 1;
    }

    return pointer;
  };

  console.log("Part 1:", p1());

  /**
   * Part Two
   */

  const p2 = () => {
    const todo = [...LRNodes.entries()]
      .filter(([key]) => key.endsWith("A"))
      .map(([, node]) => node);

    const periods = new Map<number, number>();

    let pointer = 0;

    while (periods.size !== todo.length) {
      const path = directions[pointer % directions.length];

      pointer += 1;

      todo.forEach((node, index) => {
        const next = node[path];

        if (next.endsWith("Z") && !periods.has(index)) {
          periods.set(index, pointer);
        }

        const nextNode = LRNodes.get(next);

        if (typeof nextNode === "undefined") {
          throw new Error("%s not found", nextNode);
        }

        todo[index] = nextNode;
      });
    }
    return [...periods.values()].reduce(lcm);
  };

  console.log("Part 2:", p2());
};

console.log("Day", filename);
if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
