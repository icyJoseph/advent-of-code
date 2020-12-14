const input = await Deno.readTextFile("./input/fourteen.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

type Instruction = { address: string; bin: string };
type Entry = [string, ...Instruction[]];

const zipWithMask = (bin: string, mask: string) => {
  const padded = `${"0".repeat(36 - bin.length)}${bin}`;

  return mask.split("").reduceRight((prev, curr, index) => {
    if (curr === "0" || curr === "1") {
      return `${curr}${prev}`;
    }
    return `${padded[index]}${prev}`;
  }, "");
};

const size = 512;
const bigMatrix = Array.from({ length: size }, (_, i) =>
  `${"0".repeat(size)}${i.toString(2)}`.slice(-size)
);

const decodeWithMask = (dec: number, mask: string) => {
  const bin = dec.toString(2);

  const padded = `${"0".repeat(36 - bin.length)}${bin}`;

  const floating = mask.split("").filter((bit) => bit === "X").length;
  const seed = Array.from({ length: Math.pow(2, floating) }, () => "");

  let floatingIndex = 0;

  return mask.split("").reduceRight<string[]>((prev, curr, index) => {
    if (curr === "0") {
      return prev.map((sub) => `${padded[index]}${sub}`);
    }
    if (curr === "1") {
      return prev.map((sub) => `1${sub}`);
    }
    const ret = prev.map(
      (sub, pos) => `${bigMatrix[pos][size - 1 - floatingIndex]}${sub}`
    );
    floatingIndex = floatingIndex + 1;
    return ret;
  }, seed);
};

/**
 * Part One
 */

const rows = input.map((row) => row);

const groupedByMask = rows.reduce<Entry[]>((prev, curr) => {
  const [left, right] = curr.split(" = ");
  if (left === "mask") {
    prev.push([right]);
    return prev;
  }

  const last = prev.pop() ?? ["error"];

  const address = left.replace("mem", "").replace("[", "").replace("]", "");
  const dec10 = Number(right);

  last.push({ address, bin: dec10.toString(2) });

  prev.push(last);

  return prev;
}, []);

const masked = new Map();

groupedByMask.forEach((group) => {
  const [mask, ...instr] = group;
  instr.forEach(({ address, bin }) =>
    masked.set(address, zipWithMask(bin, mask))
  );
});

console.log(
  "Part One:",
  [...masked.values()].reduce((prev, curr) => prev + parseInt(curr, 2), 0)
);

/**
 * Part Two
 */

const addr = new Map();

groupedByMask.forEach((group) => {
  const [mask, ...instr] = group;

  instr.forEach(({ address, bin }) => {
    const padded = `${"0".repeat(36 - bin.length)}${bin}`;

    decodeWithMask(Number(address), mask).forEach((next) =>
      addr.set(next, padded)
    );
  });
});

console.log(
  "Part Two:",
  [...addr.values()].reduce((prev, curr) => prev + parseInt(curr, 2), 0)
);
