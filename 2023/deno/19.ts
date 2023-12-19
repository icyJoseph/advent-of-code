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
            (w) => w.name === next.dest
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
          (w) => w.name === last.dest
        )!;
      }
    }
  });
  console.log(
    "Part 1:",
    accepted.reduce((acc, index) => {
      const { x, m, a, s } = ratings[index];

      return acc + x + m + a + s;
    }, 0)
  );

  /**
   * Part Two
   */

  const notCmp = (str: string) => {
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
              .map((s) => notCmp(s.cmp!))
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

  while (true) {
    const rejectedNode = reverse.get("R")!;

    const next = rejectedNode.slice().flatMap((row) => {
      if (row.from === "in") return row;
      const src = reverse.get(row.from)!;

      return src.map((p) => ({
        from: p.from,
        to: row.to,
        when: `${row.when} && ${p.when}`,
      }));
    });

    reverse.set("R", next);

    if (reverse.get("R")?.every((r) => r.from === "in"))
      break;
  }
  const acceptedNode = reverse.get("A")!;
  const rejectedNode = reverse.get("R")!;

  const parse2Range = (
    str: string
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

  const onRanges = acceptedNode.map(({ when }) => ({
    range: parse2Range(when),
    state: "on",
  }));
  const offRanges = rejectedNode.map(({ when }) => ({
    range: parse2Range(when),
    state: "off",
  }));

  //   console.log(parse2Range("x<1416 && a<2006 && s<1351"));
  //   console.log(
  //     parse2Range("true && true && s>2770 && true")
  //   );

  type Range = [from: number, to: number];
  type Cuboid = [Range, Range, Range, Range];

  const calcVolume = ([xr, yr, zr, wr]: Cuboid) =>
    [xr, yr, zr, wr].reduce(
      (prev, [lower, upper]) => prev * (upper - lower + 1),
      1
    );

  const axes = [0, 1, 2, 3] as const;

  const slice = (
    cuboid: Cuboid,
    overlap: Cuboid
  ): Cuboid[] => {
    const leftover = cuboid;

    const result: Cuboid[] = [];

    for (const axis of axes) {
      // For this axis:
      // from where the cuboid starts, until the lower overlap face starts
      const before: Range = [
        leftover[axis][0],
        overlap[axis][0] - 1,
      ];
      // from where the upper overlap face ends, to the end of the cuboid
      const after: Range = [
        overlap[axis][1] + 1,
        leftover[axis][1],
      ];

      // keep those that go upwards, relative to this axis
      // and using the leftover cuboid, replace the new bounds
      const newCuboids: Cuboid[] = [before, after]
        .filter(([from, to]) => to >= from)
        .map(([from, to]) => {
          const newCuboid: Cuboid = [
            leftover[0],
            leftover[1],
            leftover[2],
            leftover[3],
          ];

          newCuboid[axis] = [from, to];

          return newCuboid;
        });

      result.push(...newCuboids);

      const [from, to] = overlap[axis];

      leftover[axis] = [from, to];
    }

    return result;
  };

  const rangeOverlap = (left: Range, right: Range) => {
    return left[0] <= right[1] && left[1] >= right[0];
  };

  const haveOverlap = (left: Cuboid, right: Cuboid) =>
    rangeOverlap(left[0], right[0]) &&
    rangeOverlap(left[1], right[1]) &&
    rangeOverlap(left[2], right[2]) &&
    rangeOverlap(left[3], right[3]);

  function intersectAxis(left: Range, right: Range): Range {
    return [
      Math.max(left[0], right[0]),
      Math.min(left[1], right[1]),
    ];
  }

  const calcOverlapCuboid = (
    cuboid: Cuboid,
    other: Cuboid
  ): Cuboid => {
    return [
      intersectAxis(cuboid[0], other[0]),
      intersectAxis(cuboid[1], other[1]),
      intersectAxis(cuboid[2], other[2]),
      intersectAxis(cuboid[3], other[3]),
    ];
  };

  const fracture = (
    cuboid: Cuboid,
    other: Cuboid
  ): Cuboid | Cuboid[] => {
    if (!haveOverlap(cuboid, other)) {
      return cuboid;
    }

    const overlap = calcOverlapCuboid(cuboid, other);

    return slice(cuboid, overlap);
  };

  const isCuboid = (
    value: Cuboid | Cuboid[]
  ): value is Cuboid => {
    const flat = value.flat(1);

    return (
      flat.length === 8 &&
      flat.every((n) => typeof n === "number")
    );
  };

  /**
   * Actual solution
   */

  let cuboids: Cuboid[] = [];

  for (const { state, range: cube } of [
    ...offRanges,
    ...onRanges,
  ]) {
    cuboids = cuboids.reduce((prev: Cuboid[], group) => {
      const result = fracture(group, cube);

      return isCuboid(result)
        ? [...prev, result]
        : [...prev, ...result];
    }, []);

    if (state === "on") {
      cuboids.push(cube);
    }
  }
  console.log(
    "Part 2:",
    cuboids.map(calcVolume).reduce(sum)
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
