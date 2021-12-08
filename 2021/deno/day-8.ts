const input = await Deno.readTextFile("./input/day-8.in");

const signalRows = input.split("\n").map((row) => row.split(" | "));

const table: Record<string, number> = {};

signalRows.forEach((curr) => {
  curr[1].split(" ").forEach((x) => {
    let length = x.length;

    table[length] = (table[length] || 0) + 1;
  });
});

/**
 * Part One
 */
console.log("Part One:", table[2] + table[4] + table[3] + table[7]);

/**
 * Part Two
 */

let sum = 0;

for (const row of signalRows) {
  const [inputs, outputs] = row;

  const signals = inputs.split(" ");
  const renders = outputs.split(" ");

  const one = signals.find((x) => x.length === 2);

  const four = signals.find((x) => x.length === 4);

  const seven = signals.find((x) => x.length === 3);

  const eight = signals.find((x) => x.length === 7);

  if (!one) throw new Error("IMPOSSIBLE");
  if (!four) throw new Error("IMPOSSIBLE");
  if (!seven) throw new Error("IMPOSSIBLE");
  if (!eight) throw new Error("IMPOSSIBLE");

  const segments: Record<string, string | undefined> = {
    top: undefined,
    topLeft: undefined,
    topRight: undefined,
    middle: undefined,
    bottomLeft: undefined,
    bottomRight: undefined,
    bottom: undefined
  };

  segments.top = seven.split("").find((c) => !one.includes(c));

  const topLeft_Middle = four
    .split("")
    .filter((c) => !seven.includes(c) && c !== segments.top);

  const bottomLeft_Bottom = eight
    .split("")
    .filter((c) => !four.includes(c) && c !== segments.top);

  const nineWithoutBottom = [
    segments.top,
    ...topLeft_Middle,
    ...one.split("")
  ].join("");

  const maybeNine = signals.filter((x) => x.length === 6);

  const nine = maybeNine.find(
    (word) =>
      word.split("").filter((c) => !nineWithoutBottom.includes(c)).length === 1
  );

  if (!nine) throw new Error("IMPOSSIBLE");

  segments.bottom = nine.split("").find((c) => !nineWithoutBottom.includes(c));

  segments.bottomLeft = bottomLeft_Bottom.find((c) => c !== segments.bottom);

  const six = signals
    .filter((x) => x !== nine && x.length === 6)
    .find((word) => word.split("").filter((c) => one.includes(c)).length !== 2);

  if (!six) throw new Error("IMPOSSIBLE");

  const sixWithoutBottomRight = [
    segments.top,
    segments.bottomLeft,
    segments.bottom,
    ...topLeft_Middle
  ].join("");

  segments.bottomRight = six
    .split("")
    .find((c) => !sixWithoutBottomRight.includes(c));

  segments.topRight = one.split("").find((c) => c !== segments.bottomRight);

  const zero = signals.find((x) => x !== nine && x !== six && x.length === 6);

  if (!zero) throw new Error("IMPOSSIBLE");

  const zeroWithOutTopLeft = [
    segments.top,
    segments.bottomLeft,
    segments.bottom,
    segments.topRight,
    segments.bottomRight
  ].join("");

  segments.topLeft = zero
    .split("")
    .find((c) => !zeroWithOutTopLeft.includes(c));

  const used = Object.values(segments);

  segments.middle = "abcdefg".split("").find((c) => !used.includes(c));

  sum += Number(renders.map((word) => toDigits(word, segments)).join(""));
}

console.log("Part Two:", sum);

function toDigits(str: string, segments: Record<string, string | undefined>) {
  if (str.length === 2) return 1;

  if (str.length === 4) return 4;

  if (str.length === 3) return 7;

  if (str.length === 7) return 8;

  const chars = str.split("");

  switch (true) {
    case chars.every((c) =>
      [
        segments.top,
        segments.topLeft,
        segments.topRight,
        segments.bottomLeft,
        segments.bottomRight,
        segments.bottom
      ].includes(c)
    ):
      return 0;

    case chars.every((c) =>
      [
        segments.top,
        segments.topRight,
        segments.middle,
        segments.bottomLeft,
        segments.bottom
      ].includes(c)
    ):
      return 2;

    case chars.every((c) =>
      [
        segments.top,
        segments.topRight,
        segments.middle,
        segments.bottomRight,
        segments.bottom
      ].includes(c)
    ):
      return 3;

    case chars.every((c) =>
      [
        segments.top,
        segments.topLeft,
        segments.middle,
        segments.bottomRight,
        segments.bottom
      ].includes(c)
    ):
      return 5;

    case chars.every((c) =>
      [
        segments.top,
        segments.topLeft,
        segments.middle,
        segments.bottomRight,
        segments.bottomLeft,
        segments.bottom
      ].includes(c)
    ):
      return 6;

    case chars.every((c) =>
      [
        segments.top,
        segments.topLeft,
        segments.topRight,
        segments.middle,
        segments.bottomRight,
        segments.bottom
      ].includes(c)
    ):
      return 9;
    default:
      throw new Error("IMPOSSIBLE");
  }
}
