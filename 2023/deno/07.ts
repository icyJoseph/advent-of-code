const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

/**
 * Helpers
 */

const getType = (cards: string[], withJoker = false) => {
  const frequencies = cards.reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: (acc?.[curr] ?? 0) + 1,
    }),
    {} as Record<string, number>
  );

  if (
    withJoker &&
    frequencies["J"] &&
    frequencies["J"] !== 5
  ) {
    const [highest] = Object.entries(frequencies)
      .filter((a) => a[0] !== "J")
      .sort((a, b) => b[1] - a[1]);

    frequencies[highest[0]] += frequencies["J"];
    delete frequencies["J"];
  }

  const key = Object.values(frequencies)
    .sort((a, b) => b - a)
    .join(":");

  switch (key) {
    case "5":
      return 6;
    case "4:1":
      return 5;
    case "3:2":
      return 4;
    case "3:1:1":
      return 3;
    case "2:2:1":
      return 2;
    case "2:1:1:1":
      return 1;
    default:
      return 0;
  }
};

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */
  const game = input.split("\n").map((row) => {
    const [cards, bid] = row.split(" ");
    return { cards: cards.split(""), bid: Number(bid) };
  });

  const scoreCards = (
    game: Array<{ cards: string[]; bid: number }>,
    withJoker = false
  ) => {
    const strength = "A, K, Q, J, T, 9, 8, 7, 6, 5, 4, 3, 2"
      .split(", ")
      .reduce<Record<string, number>>(
        (acc, curr, index, src) => ({
          ...acc,
          [curr]: src.length - index,
        }),
        {}
      );

    if (withJoker) {
      strength["J"] = -1;
    }

    return game
      .map((row) => {
        return {
          ...row,
          type: getType(row.cards, withJoker),
        };
      })
      .sort((a, b) => {
        if (a.type === b.type) {
          for (let index = 0; index < 5; index++) {
            const left = a.cards[index];
            const right = b.cards[index];

            if (left === right) continue;

            return strength[left] - strength[right];
          }
        }

        return a.type - b.type;
      })
      .reduce((acc, curr, index) => {
        return acc + curr.bid * (index + 1);
      }, 0);
  };

  console.log("Part 1:", scoreCards(game));
  /**
   * Part Two
   */
  console.log("Part 2:", scoreCards(game, true));
};

console.log("Day", filename);
if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
