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

const findNested = (
  key: string,
  bags: Bag[]
): { next: Bag[]; current: string[] } => {
  const { next, current } = bags.reduce<{ next: Bag[]; current: string[] }>(
    (prev, bag) => {
      const { [key]: value, name, ...rest } = bag;
      if (!value) return { ...prev, next: [...prev.next, bag] };

      return {
        next: [...prev.next, { ...rest, name }],
        current: [...prev.current, name]
      };
    },
    { next: [], current: [] }
  );

  return current.reduce<{ next: Bag[]; current: string[] }>(
    (prev, bag) => {
      const result = findNested(bag, prev.next);
      return { ...result, current: [...prev.current, ...result.current] };
    },
    { next, current }
  );
};

const unique = new Set(findNested(MY_BAG, bags).current);

console.log("Part One:", unique.size);

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
