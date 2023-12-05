const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

/**
 * Helpers
 */

const chunks = <T>(arr: T[], size: number) =>
  arr.reduce<T[][]>((acc, row) => {
    const last = acc.pop();

    if (!last) return size > 0 ? [[row]] : [[]];

    acc.push(last);

    if (last.length < size) {
      last.push(row);
    } else {
      size > 0 ? acc.push([row]) : acc.push([]);
    }

    return acc;
  }, []);

function mapper(line: number[]) {
  const [dest, source, length] = line;

  return (input: number) => {
    const lower = source;
    const upper = source + length;

    if (input < lower || input >= upper) {
      return input;
    }

    return dest + (input - lower);
  };
}

function correctRange(input: number, line: number[]) {
  const [_, source, length] = line;

  const lower = source;
  const upper = source + length;

  return lower <= input && input < upper;
}

function intoRanges(
  input: [number, number],
  line: number[]
): Array<[number, number, done?: boolean]> {
  const [from, to] = input;
  const [_, source, length] = line;

  const lower = source;
  const upper = source + length - 1;

  const mapFn = mapper(line);

  if (to < lower) return [[from, to]];

  if (lower <= to && to <= upper) {
    if (from < lower) {
      return [
        [from, lower - 1],
        [mapFn(lower), mapFn(to), true],
      ];
    }
    return [[mapFn(from), mapFn(to), true]];
  }

  if (from < lower) {
    return [
      [from, lower - 1],
      [mapFn(lower), mapFn(upper), true],
      [upper + 1, to],
    ];
  }

  if (from < upper) {
    return [
      [mapFn(from), mapFn(upper), true],
      [upper + 1, to],
    ];
  }
  return [[from, to]];
}

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const [seeds, ...maps] = input
    .split("\n\n")
    .map((group, index) => {
      if (index === 0) {
        // seeds
        const [key, _value] = group.split(":");
        const value = _value.trim().split(" ").map(Number);
        return { key, value: [value] };
      }

      const [key, ..._value] = group.split("\n");
      const value = _value.map((row) =>
        row.split(" ").map(Number)
      );

      return { key, value };
    });

  const locations = maps
    .reduce(
      (acc, map) => {
        return acc.map((seed) => {
          // choose a range within map
          const [range] = map.value.filter((r) =>
            correctRange(seed, r)
          );
          // transform the seed
          if (!range) return seed;

          const ret = mapper(range)(seed);
          return ret;
          // return
        });
      },
      [...seeds.value.flat()]
    )
    .sort((a, b) => a - b);

  console.log("Part 1:", locations[0]);

  /**
   * Part Two
   */

  const seedRanges = chunks(seeds.value.flat(), 2).map(
    ([lower, length]) => [lower, lower + length - 1]
  );

  let min = Infinity;

  seedRanges.forEach((seedRange) => {
    const location = maps.reduce(
      (acc, map) => {
        return acc
          .map((sr) => {
            const newRanges = map.value.reduce<
              Array<[number, number, done?: boolean]>
            >(
              (carry, range) => {
                const done = carry.filter((c) => c[2]);

                const ret = carry
                  .filter((c) => !c[2])
                  .map((c) =>
                    intoRanges([c[0], c[1]], range)
                  )
                  .flat(1);
                return [...done, ...ret];
              },
              [[sr[0], sr[1]]]
            );

            return newRanges.map((c) => [c[0], c[1]]);
          })
          .flat(1);
      },
      [seedRange]
    );

    location.forEach(([low]) => {
      if (low < min) {
        min = low;
      }
    });
  });

  console.log("Part 2:", min);
};

console.log("Day", filename);
if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
