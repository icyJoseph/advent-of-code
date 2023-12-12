const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const records = input.split("\n").map((row) => {
    const [left, right] = row.split(" ");
    return {
      springs: left.split(""),
      damagedGroups: right.split(",").map(Number),
      map: right
        .split(",")
        .map(Number)
        .map((rep) => "#".repeat(rep)),
    };
  });

  function search(
    springs: string[],
    groups: number[],
    acc: { count: number } = { count: 0 },
    seen: Set<string> = new Set()
  ) {
    if (seen.has(springs.join(""))) return;

    seen.add(springs.join(""));

    const asGroups = springs
      .join("")
      .split(".")
      .filter(Boolean);

    for (let i = 0; i < asGroups.length; i++) {
      if (asGroups[i].indexOf("?") === -1) {
        // it is just #
        if (asGroups[i].length !== groups[i]) {
          return;
        }
      } else {
        break;
      }
    }

    const index = springs.findIndex((sp) => sp === "?");

    if (index !== -1) {
      let next = [...springs];
      next[index] = ".";
      search(next, groups, acc, seen);

      next = [...springs];
      next[index] = "#";
      search(next, groups, acc, seen);
    } else {
      const asGroups = springs
        .join("")
        .split(/\?|\./)
        .filter(Boolean);

      let stop = false;

      asGroups.forEach((g, index) => {
        const size = g.length;

        if (groups[index] !== size) {
          stop = true;
        }
      });

      if (stop) {
        return;
      }
      if (!stop && asGroups.length === groups.length) {
        acc.count++;
      }
    }
  }

  const acc = { count: 0 };

  records.forEach(({ springs, damagedGroups }) => {
    search(springs, damagedGroups, acc);
  });

  console.log("Part 1:", acc.count);

  const acc2 = { count: 0 };

  records.forEach(({ springs, damagedGroups }) => {
    const exSprings = [
      ...springs,
      "?",
      ...springs,
      "?",
      ...springs,
      "?",
      ...springs,
      "?",
      ...springs,
    ];
    const exGroups = [
      ...damagedGroups,
      ...damagedGroups,
      ...damagedGroups,
      ...damagedGroups,
      ...damagedGroups,
    ];
    search(exSprings, exGroups, acc2);
  });
  /**
   * Part Two
   */
  console.log("Part 2:", acc2.count);
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
