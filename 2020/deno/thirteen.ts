const input = await Deno.readTextFile("./input/thirteen.in").then((res) =>
  res.split("\n")
);

/**
 * Part One
 */

const [timestamp, busses] = input;

const ts = Number(timestamp);

const ids = busses
  .split(",")
  .filter((id) => id !== "x")
  .map(Number);

const multiples = ids
  .map((id) => {
    return { over: Math.ceil(ts / id) * id - ts, id };
  })
  .sort((a, b) => a.over - b.over);

const [{ id, over }] = multiples;

console.log("Part One:", id * over);

/**
 * Part Two
 */

// all primes
type Value = {
  val: number;
  exitValue: number;
};

const isValue = (value: Value | null): value is Value => !!value;

const [seqStart, ...loopSeq] = busses
  .split(",")
  .map((id, index) => {
    if (id === "x") return null;
    const val = Number(id);
    return { val, exitValue: val - (index % val) };
  })
  .filter(isValue);

let base = 0;
let increment = seqStart.val;

for (const { val, exitValue } of loopSeq) {
  while (1) {
    base = base + increment;

    if (base % val === exitValue) {
      increment = increment * val;
      break;
    }
  }
}

console.log("Part Two:", base);
