const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;
function assertNumber(
  a: number | undefined
): asserts a is number {
  if (typeof a !== "number") throw new Error("Undefined!");
}

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const cards = input.split("\n").map((card, index) => {
    const [, desc] = card.split(":");
    const [winningStr, holdingStr] = desc.split(" | ");

    const winning = winningStr
      .split(" ")
      .map((x) => x.trim())
      .filter(Boolean)
      .map(Number);

    const holding = holdingStr
      .split(" ")
      .map((x) => x.trim())
      .filter(Boolean)
      .map(Number);

    return { winning, holding, id: index + 1 };
  });

  const p1 = cards.reduce((acc, curr) => {
    const { winning, holding } = curr;

    const winningSet = new Set(winning);

    const points = holding.reduce((acc, num) => {
      if (!winningSet.has(num)) return acc;

      return acc + (acc || 1);
    }, 0);

    return acc + points;
  }, 0);

  console.log("Part 1:", p1);

  /**
   * Part Two
   */

  const totals = cards
    .map((curr) => {
      const { winning, holding } = curr;

      const winningSet = new Set(winning);

      const matches = holding.filter((num) =>
        winningSet.has(num)
      ).length;

      return { ...curr, matches };
    })
    .reduce((acc, curr) => {
      const { id, matches } = curr;

      acc.set(id, acc.get(id) ?? 1);

      if (matches === 0) return acc;

      Array.from(
        { length: matches },
        (_, index) => id + 1 + index
      ).forEach((newCard) => {
        const delta = acc.get(id);

        assertNumber(delta);

        const value = (acc.get(newCard) ?? 1) + delta;

        acc.set(newCard, value);
      });

      return acc;
    }, new Map<number, number>());

  const p2 = Array.from(totals.values()).reduce(sum);
  console.log("Part 2:", p2);
};

if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
