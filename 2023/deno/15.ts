const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

const peekable = (chars: string) => {
  let i = 0;
  return {
    next() {
      const value = chars[i] ?? null;
      i = i + 1;
      return value;
    },
    peek() {
      return chars[i] ?? null;
    },
  };
};

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  function getHash(str: string): number {
    let base = 0;

    const it = peekable(str);

    while (it.peek() != null) {
      const ch = it.next();

      base += ch.charCodeAt(0);
      base *= 17;
      base %= 256;
    }

    return base;
  }

  /**
   * Part One
   */

  const sequence = input.split(",");

  console.log(
    "Part 1:",
    sequence.map((seq) => getHash(seq)).reduce(sum, 0)
  );

  /**
   * Part Two
   */

  const getBoxes = () =>
    Array.from({ length: 256 }, (_, id) => ({
      id,
      lenses: [] as Array<{
        label: string;
        length: number;
      }>,
    }));

  const boxes = getBoxes();

  sequence.forEach((seq) => {
    if (seq.endsWith("-")) {
      const [label] = seq.split("-");
      const box = boxes[getHash(label)];

      const toRemove = box.lenses.findIndex(
        (l) => l.label === label
      );

      // nothing to remove
      if (toRemove === -1) return;

      box.lenses.splice(toRemove, 1);
      return;
    }

    // with =
    const [label, target] = seq.split("=");
    const box = boxes[getHash(label)];

    const newLens = {
      label,
      seq,
      length: Number(target),
    };

    const toChange = box.lenses.findIndex(
      (l) => l.label === label
    );

    if (toChange === -1) {
      box.lenses.push(newLens);
      return;
    }

    box.lenses[toChange] = newLens;
  });

  const power = boxes
    .map((box) => {
      const local = box.lenses
        .map((lense, slot) => (slot + 1) * lense.length)
        .reduce(sum, 0);

      return local * (box.id + 1);
    })
    .reduce(sum);

  console.log("Part 2:", power);
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
