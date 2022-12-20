const [__filename_ext] = new URL("", import.meta.url).pathname
  .split("/")
  .slice(-1);
const filename = __filename_ext.replace(".ts", "");

type Node = {
  value: number;
  index: number;
  next: number;
  prev: number;
};

const createNode = ({
  value,
  index,
  prev,
  next,
}: {
  value: number;
  index: number;
  prev: number;
  next: number;
}): Node => {
  return {
    value,
    index,
    next,
    prev,
  };
};

const solve = async (example = false) => {
  const input = await Deno.readTextFile(
    `./input/${example ? "example" : filename}.in`
  );

  if (example) {
    console.log("Example:", filename);
  }

  const createList = (text: string, factor = 1) =>
    text
      .split("\n")
      .map(Number)
      .map((value, index, src) =>
        createNode({
          value: value * factor,
          index,
          prev: index === 0 ? src.length - 1 : index - 1,
          next: index === src.length - 1 ? 0 : index + 1,
        })
      );

  const mixList = (source: Node[], times = 1) => {
    const list = source.map((node) => ({ ...node }));

    for (let _ = 0; _ < times; _++) {
      for (const node of list) {
        const steps = Math.abs(node.value) % (list.length - 1);

        if (steps === 0) continue;

        const self = node.index;

        // tell the next one to bind to prev
        list[list[self].next].prev = list[self].prev;
        // tell prev to bind to next
        list[list[self].prev].next = list[self].next;

        const link = node.value > 0 ? "next" : "prev";

        let current = 0;
        let pointer = self;

        // move fwd
        while (current < steps) {
          current += 1;
          pointer = list[pointer][link];
        }

        node.prev = link === "next" ? pointer : list[pointer].prev;
        node.next = link === "prev" ? pointer : list[pointer].next;

        list[node.prev].next = self;
        list[node.next].prev = self;
      }
    }

    return list;
  };

  const walkFromZero = (list: Node[]) => {
    const zero = list.findIndex((n) => n.value === 0);

    let current = 0;
    let pointer = list[zero].index;

    return {
      at(pos: number) {
        while (pos < current) {
          current -= 1;
          pointer = list[pointer].prev;
        }

        while (current < pos) {
          current += 1;
          pointer = list[pointer].next;
        }

        return list[pointer].value;
      },
    };
  };

  /**
   * Part One
   */

  const partOne = mixList(createList(input));

  const p1Walker = walkFromZero(partOne);

  console.log(
    "Part one:",
    p1Walker.at(1000) + p1Walker.at(2000) + p1Walker.at(3000)
  );

  /**
   * Part Two
   */

  const key = 811589153;
  const repetition = 10;
  const decrypt = mixList(createList(input, key), repetition);

  const walker = walkFromZero(decrypt);

  console.log("Part two:", walker.at(1000) + walker.at(2000) + walker.at(3000));
};

await solve(true);
console.log("---");
await solve();
// 9459 too low
// 20962 too high
// 18668 wrong
// 15652 wrong
// 11073 correct
