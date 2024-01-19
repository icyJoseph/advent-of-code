const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const [_workflows, _ratings] = input
    .split("\n\n")
    .map((block) => block.split("\n"));

  const workflows = _workflows.map((row) => {
    const [name, inst] = row
      .replace("{", " ")
      .replace("}", "")
      .split(" ");

    const seq = inst.split(",").map((rule, index, src) => {
      if (index === src.length - 1) return { dest: rule };
      const [cmp, dest] = rule.split(":");
      return { dest, cmp };
    });

    return {
      name,
      seq,
    };
  });

  const ratings: Array<Record<string, number>> =
    _ratings.map((row) => {
      const parts = row
        .replace("{", "")
        .replace("}", "")
        .split(",");

      return parts.reduce((acc, curr) => {
        const [key, value] = curr.split("=");
        return { ...acc, [key]: Number(value) };
      }, {});
    });

  const initial = workflows.find((w) => w.name === "in");

  if (!initial) throw new Error("initial");

  const accepted: number[] = [];

  ratings.forEach((row, index) => {
    let current = initial;
    while (true) {
      if (!current) return;

      const next = current.seq.find((rule) => {
        if (!rule.cmp) {
          return false;
        }
        // deno-lint-ignore no-unused-vars
        const { x, m, a, s } = row;
        const result = eval(rule.cmp);

        return result;
      });
      if (next) {
        if (next.dest === "A" || next.dest === "R") {
          if (next.dest === "A") accepted.push(index);

          return;
        } else {
          current = workflows.find(
            (w) => w.name === next.dest,
          )!;
          continue;
        }
      }

      const last = current.seq.at(-1);

      if (!last) throw new Error("no last");

      if (last.dest === "A" || last.dest === "R") {
        if (last.dest === "A") accepted.push(index);

        return;
      } else {
        current = workflows.find(
          (w) => w.name === last.dest,
        )!;
      }
    }
  });
  console.log(
    "Part 1:",
    accepted.reduce((acc, index) => {
      const { x, m, a, s } = ratings[index];

      return acc + x + m + a + s;
    }, 0),
  );

  /**
   * Part Two
   */

  const complement = (str: string) => {
    if (str.includes(">")) {
      // x>3 -> x<4
      const [name, bound] = str.split(">");
      return `${name}<${Number(bound) + 1}`;
    }
    // x<3 -> x>2
    const [name, bound] = str.split("<");
    return `${name}>${Number(bound) - 1}`;
  };

  const map = workflows.flatMap((row) => {
    return row.seq.map((s, index) => {
      const when =
        index === 0
          ? s.cmp!
          : `${row.seq
              .slice(0, index)
              .map((s) => complement(s.cmp!))
              .join(" && ")} ${
              s.cmp ? `&& ${s.cmp}` : ""
            }`.trim();

      return {
        from: row.name,
        to: s.dest,
        when,
      };
    });
  });

  const reverse = new Map<
    string,
    Array<{ from: string; to: string; when: string }>
  >();

  map.forEach(({ from, to, when }) => {
    const current = reverse.get(to) ?? [];
    current.push({ from, to, when });
    reverse.set(to, current);
  });

  while (true) {
    const acceptedNode = reverse.get("A")!;

    const next = acceptedNode.slice().flatMap((row) => {
      if (row.from === "in") return row;
      const src = reverse.get(row.from)!;

      return src.map((p) => ({
        from: p.from,
        to: row.to,
        when: `${row.when} && ${p.when}`,
      }));
    });

    reverse.set("A", next);

    if (reverse.get("A")?.every((r) => r.from === "in"))
      break;
  }

  const acceptedNode = reverse.get("A")!;

  const parse2Range = (
    str: string,
  ): [Range, Range, Range, Range] => {
    const x = [1, 4000];
    const m = [1, 4000];
    const a = [1, 4000];
    const s = [1, 4000];

    const ranges = { x, m, a, s };

    const q = str.split(" && ").map((x) => x.trim());

    q.forEach((cnd) => {
      if (cnd.includes(">")) {
        // lower bound
        const [key, _bound] = cnd.split(">");
        if (
          key !== "x" &&
          key !== "m" &&
          key !== "a" &&
          key !== "s"
        ) {
          return;
        }
        const bound = Number(_bound);
        if (bound > ranges[key][0]) {
          // more strict bound
          ranges[key][0] = Number(_bound) + 1;
        }
      } else {
        // a<1000 upper bound
        const [key, _bound] = cnd.split("<");
        if (
          key !== "x" &&
          key !== "m" &&
          key !== "a" &&
          key !== "s"
        ) {
          return;
        }
        const bound = Number(_bound);
        if (bound < ranges[key][1]) {
          // more strict bound
          ranges[key][1] = Number(_bound) - 1;
        }
      }
    });

    return [
      [ranges.x[0], ranges.x[1]],
      [ranges.m[0], ranges.m[1]],
      [ranges.a[0], ranges.a[1]],
      [ranges.s[0], ranges.s[1]],
    ];
  };

  const acceptedRanges = acceptedNode.map(({ when }) =>
    parse2Range(when),
  );

  type Range = [from: number, to: number];
  type Ranges = [Range, Range, Range, Range];

  const calcVolume = ([xr, yr, zr, wr]: Ranges) =>
    [xr, yr, zr, wr].reduce(
      (prev, [lower, upper]) => prev * (upper - lower + 1),
      1,
    );

  console.log(
    "Part 2:",
    acceptedRanges.map(calcVolume).reduce(sum),
  );
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/${filename}.example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
