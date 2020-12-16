const input = await Deno.readTextFile("./input/sixteen.in").then((res) =>
  res.split("\n\n")
);

/**
 * Helpers
 */

type InclusiveRange = [lower: number, upper: number];
const inRange = (num: number, [l, r]: InclusiveRange) => num >= l && num <= r;

const inSegmentedRange = (
  num: number,
  leftRange: InclusiveRange,
  rightRange: InclusiveRange
) => inRange(num, leftRange) || inRange(num, rightRange);

/**
 * Part One
 */

const [fieldRanges, myTicket, others] = input.map((row) => row);

const ranges: {
  name: string;
  lower: InclusiveRange;
  upper: InclusiveRange;
}[] = fieldRanges.split("\n").map((rule) => {
  const [name, range] = rule.split(": ");

  const [lower, upper] = range.split(" or ").map((sub) => {
    const [l, r] = sub.split("-").map(Number);

    return [l, r] as InclusiveRange;
  });

  return { name, lower, upper };
});

const [, ...nearbyTickets] = others.split("\n");

const nearbyNumbers = nearbyTickets.map((row) =>
  row.split(",").map((value, field) => ({ value: Number(value), field }))
);

const checkValidity = nearbyNumbers.flat(1).map(({ value, field }) => {
  const isValid = ranges.some(({ lower, upper }) =>
    inSegmentedRange(value, lower, upper)
  );
  return { value, field, isValid };
});

const errorRate = checkValidity
  .filter(({ isValid }) => !isValid)
  .reduce((prev, { value }) => prev + value, 0);

console.log("Part One:", errorRate, 20091);

/**
 * Part Two
 */

const validOnly = checkValidity.filter(({ isValid }) => isValid);

const groupedByfield = validOnly.reduce<Map<number, number[]>>(
  (prev, { field, value }) => {
    const curr = prev.get(field) ?? [];
    const next = [...curr, value];

    next.sort((a, b) => a - b);
    prev.set(field, next);

    return prev;
  },
  new Map()
);

const withCandidates = [...groupedByfield.entries()].map(([field, values]) => {
  const candidates = ranges
    .filter(({ lower, upper }) => {
      return values.every((val) => inSegmentedRange(val, lower, upper));
    })
    .map(({ name }) => name);

  return { field, values, candidates };
});

const exhaustCandidates = (
  arr: { field: number; values: number[]; candidates: string[] }[],
  dict: Map<number, string> = new Map(),
  seen: Set<string> = new Set()
): Map<number, string> => {
  const next = arr.find(
    ({ candidates }) => candidates.filter((c) => !seen.has(c)).length === 1
  );

  if (!next) return dict;

  const { field, candidates } = next;
  const name = candidates.find((c) => !seen.has(c));

  if (!name) return dict;

  dict.set(field, name);
  seen.add(name);

  return exhaustCandidates(arr, dict, seen);
};

const dict = exhaustCandidates(withCandidates);

/* Parsing my tickets field */
const [, myFields] = myTicket.split("\n");

const myValues = myFields.split(",").map(Number);

/* Select departure values */
const departures = [...dict.entries()]
  .filter(([, name]) => name.includes("departure"))
  .map(([key]) => myValues[key]);

console.assert(departures.length === 6, "Number of departure fields is wrong");

console.log(
  "Part Two:",
  departures.reduce((prev, curr) => prev * curr, 1),
  2325343130651
);
