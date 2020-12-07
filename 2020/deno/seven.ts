const input = await Deno.readTextFile("./input/seven.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const MY_BAG = "shiny gold";

const processBag = (content: string) => {
  if (content.includes("no other")) return {};

  const [qty, color, accent] = content.split(" ");

  return { [`${color} ${accent}`]: parseInt(qty) };
};

/**
 * Part One
 */

interface Bag extends Record<string, string | number> {
  name: string;
}

const bags: Bag[] = input.map((row) => {
  const [fullColor, spec] = row.split("contain");
  const [accent, color] = fullColor.split(" ");

  const contents = spec
    .split(",")
    .map((x) => x.trim())
    .reduce<Record<string, number>>((prev, curr) => {
      return {
        ...prev,
        ...processBag(curr)
      };
    }, {});

  return {
    ...contents,
    name: `${accent} ${color}`
  };
});

const container = new Set(
  bags.filter((x) => x[MY_BAG]).map(({ name }) => name)
);

let prevSize = 0;

while (1) {
  prevSize = container.size;

  for (const entry of [...container]) {
    bags
      .filter((bag) => bag[entry])
      .flat(Infinity)
      .forEach(({ name }) => container.add(name));
  }

  if (container.size === prevSize) break;
}

console.log("Part One:", container.size);

/**
 * Part Two
 */

const countNested = (key: string, countSelf: boolean = false): number => {
  const current = bags.find((x) => x.name === key);

  if (!current) throw new Error(`Bag not found: ${key}`);

  if (Object.keys(current).length === 1) return 0;

  return Object.keys(current)
    .filter((x) => x !== "name")
    .map((x) => {
      const qty = current[x] as number;

      const mult = countNested(x, true);

      if (!mult) {
        return qty;
      }

      return mult * qty;
    })
    .reduce((prev, curr) => prev + curr, countSelf ? 1 : 0);
};

console.log("Part Two:", countNested(MY_BAG));
