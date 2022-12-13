const input = await Deno.readTextFile("./input/13.in");

const pairs = input.split("\n\n").map((packet) => packet.split("\n"));

/**
 * Part one
 */

type Packet = number | Packet[];
type Order = "yes" | "no" | "continue";

const compare = (left: Packet, right: Packet): Order => {
  if (typeof left === "number" && typeof right === "number") {
    if (left < right) return "yes";
    if (left > right) return "no";
    return "continue";
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    let pointer = 0;

    while (true) {
      const nextLeft = left[pointer];
      const nextRight = right[pointer];

      const isLeftOver = pointer === left.length;
      const isRightOver = pointer === right.length;

      if (isLeftOver && isRightOver) return "continue";

      if (isLeftOver) return "yes";

      if (isRightOver) return "no";

      const result = compare(nextLeft, nextRight);

      if (result !== "continue") {
        return result;
      }

      pointer += 1;
    }
  }

  if (typeof left === "number" && Array.isArray(right)) {
    return compare([left], right);
  }

  if (Array.isArray(left) && typeof right === "number") {
    return compare(left, [right]);
  }

  throw new Error("Can't compare");
};

const packets = pairs.map(
  (pair) => pair.map<Packet>((packet) => JSON.parse(packet)) // eval works too
);

const orderedIndexes = packets.reduce<number[]>((prev, pair, index) => {
  const result = compare(pair[0], pair[1]);
  if (result === "yes") {
    prev.push(index + 1);
  }

  return prev;
}, []);

console.log(
  "Part one:",
  orderedIndexes.reduce((a, b) => a + b)
);

/**
 * Part two
 */

const two = [[2]];
const six = [[6]];

const allPackets = [...packets.flat(1), two, six];

const sorted = allPackets.slice(0).sort((left, right) => {
  return compare(left, right) === "yes" ? -1 : 1;
});

console.log("Part two:", (sorted.indexOf(two) + 1) * (sorted.indexOf(six) + 1));
