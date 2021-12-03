const input = await Deno.readTextFile("./input/day-3.in");

const rows = input.split("\n");

const binaries = rows.map((row) => row.split(""));

const len = binaries[0].length;

const gamma = Array.from({ length: len }, (_, i) => {
  const ones = binaries.reduce(
    (acc, bin) => (bin[i] === "1" ? acc + 1 : acc),
    0
  );
  const zeros = binaries.reduce(
    (acc, bin) => (bin[i] === "0" ? acc + 1 : acc),
    0
  );

  return ones > zeros ? "1" : "0";
}).join("");

const epsilon = Array.from({ length: len }, (_, i) => {
  const ones = binaries.reduce(
    (acc, bin) => (bin[i] === "1" ? acc + 1 : acc),
    0
  );
  const zeros = binaries.reduce(
    (acc, bin) => (bin[i] === "0" ? acc + 1 : acc),
    0
  );

  return zeros > ones ? "1" : "0";
}).join("");

/**
 * Part One
 */

console.log("Part One:", parseInt(gamma, 2) * parseInt(epsilon, 2));

/**
 * Part Two
 */

let bit = 0; // first bit
let oxygen = binaries.slice(0);
let co2 = binaries.slice(0);

while (1) {
  if (oxygen.length === 1) {
    break;
  }
  const ones = oxygen.reduce(
    (acc, bin) => (bin[bit] === "1" ? acc + 1 : acc),
    0
  );
  const zeros = oxygen.reduce(
    (acc, bin) => (bin[bit] === "0" ? acc + 1 : acc),
    0
  );

  if (ones >= zeros) {
    oxygen = oxygen.filter((bin) => bin[bit] === "1");
  } else {
    oxygen = oxygen.filter((bin) => bin[bit] === "0");
  }

  bit = (bit + 1) % len;
}

// reset the bit
bit = 0;

while (1) {
  if (co2.length === 1) {
    break;
  }
  const ones = co2.reduce((acc, bin) => (bin[bit] === "1" ? acc + 1 : acc), 0);
  const zeros = co2.reduce((acc, bin) => (bin[bit] === "0" ? acc + 1 : acc), 0);

  if (zeros > ones) {
    co2 = co2.filter((bin) => bin[bit] === "1");
  } else {
    co2 = co2.filter((bin) => bin[bit] === "0");
  }

  bit = (bit + 1) % len;
}

console.log(
  "Part Two:",
  parseInt(oxygen[0].join(""), 2) * parseInt(co2[0].join(""), 2)
);
