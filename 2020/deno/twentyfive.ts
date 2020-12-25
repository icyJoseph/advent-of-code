const input = await Deno.readTextFile("./input/twentyfive.in").then((res) =>
  res.split("\n").map(Number)
);

/**
 * Part One
 */

const mod = 20201227;

const enc = (val: number, num: number) => (val * num) % mod;

const xform = (num: number, length: number) =>
  Array.from({ length }, () => num).reduce(enc);

const digest = (target: number): number => {
  let loop = 0;
  let value = 1;

  while (target !== value) {
    loop = loop + 1;
    value = enc(value, 7);
  }

  return loop;
};

const [cardPk, doorPk] = input;

console.log("Part One:", xform(doorPk, digest(cardPk)));
console.log("Verify:", xform(cardPk, digest(doorPk)));
