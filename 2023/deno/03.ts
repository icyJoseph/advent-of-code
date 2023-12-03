const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

/**
 * Helpers
 */

function calcDeltas() {
  const dirs = [0, 1, -1];

  const deltas = dirs
    .flatMap((x) => dirs.map((y) => [x, y]))
    .filter(([x, y]) => Math.abs(x) + Math.abs(y) !== 0);

  return deltas;
}

const sum = (a: number, b: number) => a + b;
const prod = (a: number, b: number) => a * b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  type Coord = { x: number; y: number };
  type NumberCell = { value: number; pos: Coord[] };
  type Cells = NumberCell | { value: string; pos: Coord };

  const isNumberCell = (
    cell: Cells
  ): cell is NumberCell => {
    return typeof cell.value === "number";
  };

  const p1 = input.split("\n").map((row, y) => {
    return row.split("").reduce<Cells[]>((acc, ch, x) => {
      const last = acc.pop();
      if (!last) {
        if (!isNaN(Number(ch))) {
          return [
            ...acc,
            { value: Number(ch), pos: [{ x, y }] },
          ];
        }
        return [...acc, { value: ch, pos: { x, y } }];
      }

      if (isNumberCell(last)) {
        if (!isNaN(Number(ch))) {
          return [
            ...acc,
            {
              value: last.value * 10 + Number(ch),
              pos: last.pos.concat({ x, y }),
            },
          ];
        }
      }
      if (!isNaN(Number(ch))) {
        return [
          ...acc,
          last,
          {
            value: Number(ch),
            pos: [{ x, y }],
          },
        ];
      }

      return [...acc, last, { value: ch, pos: { x, y } }];
    }, []);
  });

  const parts = new Set<NumberCell>();
  const gears = new Map<unknown, NumberCell[]>();

  p1.forEach((row) => {
    row.forEach((entry) => {
      if (!isNumberCell(entry)) return;
      if (parts.has(entry)) return;

      entry.pos.forEach((coord) => {
        if (parts.has(entry)) return;

        calcDeltas().forEach(([dx, dy]) => {
          if (parts.has(entry)) return;

          const y = dy + coord.y;
          const x = dx + coord.x;

          const adjCell = p1[y]?.find(
            (cell) =>
              !isNumberCell(cell) &&
              cell.pos.y === y &&
              cell.pos.x === x
          );

          if (
            adjCell &&
            typeof adjCell.value !== "number" &&
            adjCell.value !== "."
          ) {
            parts.add(entry);

            if (adjCell.value === "*") {
              const curr = gears.get(adjCell) ?? [];
              gears.set(adjCell, curr.concat(entry));
            }
          }
        });
      });
    });
  });

  console.log(
    "Part 1:",
    [...parts].map(({ value }) => value).reduce(sum)
  );

  /**
   * Part Two
   */
  console.log(
    "Part 2:",
    Array.from(gears.values())
      .filter((parts) => parts.length === 2)
      .map((parts) =>
        parts.map(({ value }) => value).reduce(prod)
      )
      .reduce(sum)
  );
};

console.log("Day %s \n", filename);

if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
