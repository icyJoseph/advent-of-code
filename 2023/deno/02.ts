const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const initial = { red: 0, green: 0, blue: 0 };

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const games = input.split("\n").map((game) => {
    const [title, desc] = game.split(": ");
    const [, id] = title.split(" ");

    const gameSets = desc.split("; ").map((seq) => {
      const dice = seq.split(", ");

      return dice.reduce((acc, curr) => {
        const [value, key] = curr.split(" ");
        return { ...acc, [key]: Number(value) };
      }, initial);
    });

    return { id: Number(id), gameSets };
  });

  const limits = {
    red: 12,
    green: 13,
    blue: 14,
  };

  const p1 = games
    .filter(({ gameSets }) =>
      gameSets.every((gameSet) => {
        return (
          gameSet.blue <= limits.blue &&
          gameSet.green <= limits.green &&
          gameSet.red <= limits.red
        );
      })
    )
    .map(({ id }) => id)
    .reduce(sum);

  console.log("Part 1:", p1);

  /**
   * Part Two
   */

  const p2 = games
    .map(({ gameSets }) =>
      gameSets.reduce((acc, game) => {
        return {
          green: Math.max(game.green, acc.green),
          red: Math.max(game.red, acc.red),
          blue: Math.max(game.blue, acc.blue),
        };
      }, initial)
    )
    .map(({ red, green, blue }) => red * green * blue)
    .reduce(sum);

  console.log("Part 2:", p2);
};

if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/example.in`);
} else {
  console.log("Problem");
  await solve(`./input/${filename}.in`);
}
