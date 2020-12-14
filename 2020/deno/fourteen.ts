const input = await Deno.readTextFile("./input/fourteen.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const zipWithMask = (bin: string, mask: string) => {
  const padded = `${"0".repeat(36 - bin.length)}${bin}`;
  return mask.split("").reduceRight((prev, curr, index) => {
    if (curr === "0") {
      return `0${prev}`;
    } else if (curr === "1") {
      return `1${prev}`;
    } else if (curr === "X") {
      return `${padded[index]}${prev}`;
    }
    return prev;
  }, "");
};

const size = 512;
const bigMatrix = Array.from({ length: size }, (_, i) => {
  return `${"0".repeat(size)}${i.toString(2)}`.slice(-size);
});

const decodeWithMask = (dec: number, mask: string) => {
  const bin = dec.toString(2);

  const padded = `${"0".repeat(36 - bin.length)}${bin}`;

  const floating = mask.split("").filter((bit) => bit === "X").length;
  const seed = Array.from({ length: Math.pow(2, floating) }, () => "");

  let floatingIndex = 0;

  const dist = (position: number) => {
    const entry = bigMatrix[position][size - 1 - floatingIndex];
    return entry;
  };

  return mask.split("").reduceRight<string[]>((prev, curr, index) => {
    if (curr === "0") {
      return prev.map((sub) => `${padded[index]}${sub}`);
    } else if (curr === "1") {
      return prev.map((sub) => `1${sub}`);
    } else if (curr === "X") {
      const ret = prev.map((sub, pos: number) => `${dist(pos)}${sub}`);
      floatingIndex = floatingIndex + 1;
      return ret;
    }
    return prev;
  }, seed);
};

/**
 * Part One
 */

const rows = input.map((row) => row);

type Instruction = { address: string; bin: string };

type Entry = [string, ...Instruction[]];

const groupedByMask = rows.reduce<Entry[]>((prev, curr) => {
  const [left, right] = curr.split(" = ");
  if (left === "mask") {
    return [...prev, [right]];
  }

  const last = prev.pop() ?? ["error"];

  const address = left.replace("mem", "").replace("[", "").replace("]", "");
  const dec10 = Number(right);

  last.push({ address, bin: dec10.toString(2) });

  return [...prev, last];
}, []);

const masked = new Map();

groupedByMask.forEach((group) => {
  const [mask, ...instr] = group;
  instr.forEach(({ address, bin }) => {
    masked.set(address, zipWithMask(bin, mask));
  });
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
    const result = decodeWithMask(Number(address), mask);
    const padded = `${"0".repeat(36 - bin.length)}${bin}`;

    for (const next of result) {
      addr.set(next, padded);
    }
  });
});

console.log(
  "Part Two:",
  [...addr.values()].reduce((prev, curr) => prev + parseInt(curr, 2), 0)
);
