const isDebug = Deno.args.includes("--debug");
const log = console.log;

/**
 * Helpers
 */

const solve = (input: string, ans: Answer) => {
  const [patternSpec, designsSpec] = input.split("\n\n");

  const pattern = patternSpec.split(", ");

  const designs = designsSpec.split("\n");

  function search(
    steps: string[],
    design: string,
    current = "",
    count = 0,
    cache = new Map<string, number>()
  ) {
    if (current === design) return 1;

    if (cache.has(current)) return cache.get(current)!;

    steps.forEach((step) => {
      if (design.startsWith(current + step)) {
        count += search(steps, design, current + step, 0, cache);
      }
    });

    cache.set(current, count);
    return count;
  }

  designs.forEach((design) => {
    const total = search(pattern, design);

    /**
     * Part One
     */
    ans.p1 += total ? 1 : 0;
    /**
     * Part Two
     */
    ans.p2 += total;
  });
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
