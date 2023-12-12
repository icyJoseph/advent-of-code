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

  function search(
    springs: string[],
    groups: number[],
    global: { count: number },
    seen: Map<string, number> = new Map()
  ) {
    if (
      seen.has(springs.join("") + "::" + groups.join(","))
    ) {
      const result = seen.get(
        springs.join("") + "::" + groups.join(",")
      );

      if (typeof result !== "number")
        throw new Error("Missed cache hit");

      global.count += result;
      return;
    }

    // group length + ".", except for the last one
    const spaceNeeded = groups.reduce(
      (acc, length, index, src) =>
        acc + length + (src.length - 1 === index ? 0 : 1),
      0
    );

    const spaceAvailable = springs.length;

    if (spaceAvailable < spaceNeeded) {
      return;
    }

    if (spaceNeeded === 0 && spaceAvailable === 0) {
      global.count++;
      return;
    }

    if (spaceNeeded === 0) {
      if (springs.every((sp) => sp !== "#")) {
        global.count++;
      }

      return;
    }

    const local = { count: 0 };

    switch (springs[0]) {
      case ".": {
        search(springs.slice(1), groups, local, seen);

        seen.set(
          springs.join("") + "::" + groups.join(","),
          local.count
        );

        break;
      }

      case "#": {
        const maybeLongBlock = springs
          .slice(0, groups[0])
          .join("")
          .replaceAll("?", "#");

        if (maybeLongBlock !== "#".repeat(groups[0])) {
          // it was not a long block
          break;
        }

        // jump over the long block
        // but only if the next element is not a "#"
        // a '.' or '?' would be fine...
        if (springs[groups[0]] === "#") break;

        search(
          // leave a space between longBlock and next springs
          springs.slice(groups[0] + 1),
          groups.slice(1),
          local,
          seen
        );

        break;
      }

      case "?": {
        // branch out
        const next = [...springs];
        next[0] = "#";
        search(next, groups, local, seen);

        next[0] = ".";
        search(next, groups, local, seen);

        break;
      }
      default:
        throw new Error(springs.join(""));
    }

    global.count += local.count;

    return;
  }

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

  /**
   * Part One
   */

  console.log(
    "Part 1:",
    records.reduce(
      (acc, { springs, damagedGroups }) => {
        search(springs, damagedGroups, acc);

        return acc;
      },
      { count: 0 }
    ).count
  );

  /**
   * Part Two
   */
  const p2 = records.reduce(
    (acc, { springs, damagedGroups }) => {
      const exSprings = Array(5)
        .fill(springs.join(""))
        .join("?")
        .split("");

      const exGroups = Array(5)
        .fill(damagedGroups.join(","))
        .join(",")
        .split(",")
        .map(Number);

      search(exSprings, exGroups, acc);

      return acc;
    },
    { count: 0 }
  );

  console.log("Part 2:", p2.count);
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
