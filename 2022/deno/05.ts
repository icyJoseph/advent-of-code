const input = await Deno.readTextFile("./input/05.in");

const [initial, instructions] = input
  .split("\n\n")
  .map((block) => block.split("\n"));

const reg = /(\s{4}|[A-Z{1}])/g;

const getStacks = () =>
  initial
    .slice(0, -1) // labels at bottom
    .map((row) => row.match(reg) || [])
    .reduce<string[][]>(
      (cols, row, _) => {
        row.forEach((cell, index) => {
          if (cell.trim()) {
            cols[index] = [cell, ...cols[index]];
          }
        });
        return cols;
      },
      Array.from({ length: 9 }, () => [] as string[])
    );

const unwind =
  (transport: (source: string[], start: number) => string[]) =>
  (stacks: string[][], move: string) => {
    const [qty, from, to] = move
      .split(" ")
      .map(Number)
      .filter((x) => !isNaN(x));

    const selected = stacks[from - 1];
    const start = selected.length - qty;

    stacks[to - 1].push(...transport(selected, start));

    selected.length = selected.length - qty;

    return stacks;
  };

/**
 * Part One
 */

const crane9000 = unwind((selected: string[], start: number) => {
  return selected.slice(start).reverse();
});

console.log(
  "Part one:",
  instructions
    .reduce(crane9000, getStacks())
    .map((stack) => stack[stack.length - 1])
    .join("")
);

/**
 * Part Two
 */

const crane9001 = unwind((selected: string[], start: number) => {
  return selected.slice(start);
});

console.log(
  "Part two:",
  instructions
    .reduce(crane9001, getStacks())
    .map((stack) => stack[stack.length - 1])
    .join("")
);
