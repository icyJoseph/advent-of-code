const input = await Deno.readTextFile("./input/nine.in").then((res) =>
  res.split("\n").map(Number)
);

/**
 * Helpers
 */

// From Day one :)
const findComplement = (target: number, arr: number[]): number[] => {
  const set = new Set(arr);

  return arr.map((x) => target - x).filter((x) => set.has(x));
};

/**
 * Part One
 */

const preamble = 25;

let i = 0;
let weakness = 0;

while (1) {
  const current = input[i + preamble];
  const complements = findComplement(current, input.slice(i, i + preamble));

  if (!complements.length) {
    weakness = current;
    break;
  }
  i = i + 1;
}

console.log("Part One:", weakness);

/**
 * Part Two
 */

let start = 0;
let end = 0;

outer: while (1) {
  const sumWindow = input.slice(start);
  end = start + 1;

  let acc = 0;

  for (const num of sumWindow) {
    acc = num + acc;

    if (acc === weakness) {
      break outer;
    }
    if (acc > weakness) {
      break;
    }
    end = end + 1;
  }
  start = start + 1;
}

const group = input.slice(start, end).sort();

console.assert(
  group.reduce((prev, curr) => prev + curr, 0) === weakness,
  "Numbers don't add up!"
);

const [head] = group;
const [last] = group.slice(-1);

console.log("Part Two:", head + last);
