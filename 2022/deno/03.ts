const input = await Deno.readTextFile("./input/03.in");

const data = input.split("\n").map((row) => row.split(""));

const lowercaseBound = "a".charCodeAt(0);
const uppercaseBound = "A".charCodeAt(0);

const getPriority = (ch: string) => {
  const isLowercase = ch.toLowerCase() === ch;

  return isLowercase
    ? ch.charCodeAt(0) - lowercaseBound
    : ch.charCodeAt(0) - uppercaseBound + 27;
};

/**
 * Part One
 */

const partOne = data
  .map((sack) => [sack.slice(0, sack.length / 2), sack.slice(sack.length / 2)])
  .reduce((prev, [left, right]) => {
    const repeated = right.find((r) => left.includes(r));

    if (!repeated) throw new Error("No repetition found");

    return prev + getPriority(repeated);
  }, 0);

console.log("Part one:", partOne);

/**
 * Part Two
 */

const groups = data.reduce<string[][][]>((acc, row) => {
  const last = acc.pop();

  if (!last) return [[row]];

  acc.push(last);

  if (last.length < 3) {
    last.push(row);
  } else {
    acc.push([row]);
  }

  return acc;
}, []);

const partTwo = groups
  .map((group) => {
    const freqs = group
      // unique in the sub group
      .map((row) => [...new Set(row)])
      .flat(1)
      // count unique repetitions
      .reduce<Record<string, number>>((prev, curr) => {
        prev[curr] = prev[curr] || 0;
        prev[curr] += 1;

        return prev;
      }, {});

    // only one should have length 3
    const badge = Object.entries(freqs).find(([_, value]) => value === 3);

    if (!badge) throw new Error("No badge found");

    return badge[0];
  })
  .reduce((acc, curr) => {
    return acc + getPriority(curr);
  }, 0);

console.log("Part two:", partTwo);
