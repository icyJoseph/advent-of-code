const filename = "17";

const solve = async (pathname: string) => {
  const input = await Deno.readTextFile(pathname);

  /*

####

.#.
###
.#.

..#
..#
###

#
#
#
#

##
##

  */

  type RockType = "-" | "+" | "inverted-L" | "|" | "square";

  const createRock = (type: RockType, bottom: number) => {
    const self = { left: 2, bottom, settled: false };

    function move(delta: { left: number; down: number }) {
      self.left = self.left + delta.left;
      self.bottom = self.bottom + delta.down;
    }

    function isSettled() {
      return self.settled;
    }

    function setSettled() {
      self.settled = true;
    }

    switch (type) {
      case "-":
        return {
          type,
          get self() {
            return { ...self };
          },
          get coords() {
            return [
              [self.left, self.bottom],
              [self.left + 1, self.bottom],
              [self.left + 2, self.bottom],
              [self.left + 3, self.bottom],
            ];
          },
          get top() {
            return self.bottom;
          },
          move,
          isSettled,
          setSettled,
        };
      case "+":
        return {
          type,
          get self() {
            return { ...self };
          },
          get coords() {
            return [
              [self.left + 1, self.bottom + 2],
              [self.left, self.bottom + 1],
              [self.left + 1, self.bottom + 1],
              [self.left + 2, self.bottom + 1],
              [self.left + 1, self.bottom],
            ];
          },
          get top() {
            return self.bottom + 2;
          },
          move,
          isSettled,
          setSettled,
        };
      case "inverted-L":
        return {
          type,
          get self() {
            return { ...self };
          },
          get coords() {
            return [
              [self.left + 2, self.bottom + 2],
              [self.left + 2, self.bottom + 1],
              [self.left, self.bottom],
              [self.left + 1, self.bottom],
              [self.left + 2, self.bottom],
            ];
          },
          get top() {
            return self.bottom + 2;
          },
          move,
          isSettled,
          setSettled,
        };
      case "|":
        return {
          type,
          get self() {
            return { ...self };
          },
          get coords() {
            return [
              [self.left, self.bottom + 3],
              [self.left, self.bottom + 2],
              [self.left, self.bottom + 1],
              [self.left, self.bottom],
            ];
          },
          get top() {
            return self.bottom + 3;
          },
          move,
          isSettled,
          setSettled,
        };
      case "square":
        return {
          type,
          get self() {
            return { ...self };
          },
          get coords() {
            return [
              [self.left, self.bottom + 1],
              [self.left + 1, self.bottom + 1],
              [self.left, self.bottom],
              [self.left + 1, self.bottom],
            ];
          },
          get top() {
            return self.bottom + 1;
          },
          move,
          isSettled,
          setSettled,
        };
    }
  };

  const rockCycle: Readonly<RockType[]> = Object.freeze([
    "-",
    "+",
    "inverted-L",
    "|",
    "square",
  ]);
  const jetsCycle = input.split("");

  const makeIterator = <T>(list: Readonly<T[]>) => {
    let index = 0;

    return {
      next() {
        const value = list[index];
        const pos = index;
        index = (index + 1) % list.length;
        return [pos, value] as const;
      },
    };
  };

  const width = 7; // |..@@@@.|
  const floor = 0;
  const gap = 3 + 1;

  const rockTypeIt = makeIterator(rockCycle);
  const jetsIt = makeIterator(jetsCycle);

  let current = createRock(rockTypeIt.next()[1], floor + gap);

  const filled = new Set<number>();

  type Rock = ReturnType<typeof createRock>;
  const settled: Rock[] = [];

  // 1_000_000_000_000
  const limit = 1_000_000_000_000;

  const wave = [0, 0, 0, 0, 0, 0, 0];

  const cache = new Set();
  const delta: Record<string, number> = {};
  type Cycle = { key: string; delta: number };
  const cycle: Cycle[] = [];

  const runToCompletion = (todo: number, steps: Cycle[]) => {
    const cycleDelta = steps
      .map(({ delta }) => delta)
      .reduce((a, b) => a + b, 0);

    const reps = Math.floor(todo / steps.length);
    const leftover = todo % steps.length;

    return (
      reps * cycleDelta +
      cycle
        .slice(0, leftover)
        .map(({ delta }) => delta)
        .reduce((a, b) => a + b, 0)
    );
  };

  while (true) {
    const [index, jet] = jetsIt.next();

    const min = Math.min(...wave);

    const key = `${index}.${jet}.${current.type}.${wave
      .map((n) => n - min)
      .join(" ")}`;

    if (cache.size > 0 && cycle.length === cache.size && key === cycle[0].key) {
      const [top] = wave.slice(0).sort((a, b) => b - a);

      const isExample = pathname.includes("example");
      if (isExample) {
        // Make sure we also print the example part one
        console.log(
          "Part one:",
          top + runToCompletion(2022 - settled.length, cycle)
        );
      }

      console.log(
        "Part two:",
        top + runToCompletion(limit - settled.length, cycle)
      );

      break;
    }

    if (jet === "<") {
      current.move({ left: -1, down: 0 });
    } else {
      // ">"
      current.move({ left: 1, down: 0 });
    }

    const hitWalls = current.coords.some(([x, _]) => x < 0 || x >= width);
    // the x movement caused it to touch filled
    const hitsFilledX = current.coords.some(([x, y]) =>
      filled.has(y * width + x)
    );

    // undo
    if (hitWalls || hitsFilledX) {
      if (jet === "<") {
        current.move({ left: 1, down: 0 });
      } else {
        // ">"
        current.move({ left: -1, down: 0 });
      }
    }

    // then fall
    current.move({ left: 0, down: -1 });

    // check that no collisions exist
    const hitsFloor = current.coords.some(([_, y]) => y === 0);
    const hitsFilled = current.coords.some(([x, y]) =>
      filled.has(y * width + x)
    );

    const [initialTop] = wave.slice(0).sort((a, b) => b - a);

    if (hitsFloor || hitsFilled) {
      // undo
      current.move({ left: 0, down: 1 });
      // settle
      current.setSettled();
    }
    // console.log("After gravity", current.self, current.type);

    if (current.isSettled()) {
      /**
       * Part One
       *
       * Note that for the example, the cache stabilizes
       * way before 2022... rocks
       */
      if (settled.length === 2022) {
        console.log("Part one:", wave.slice(0).sort((a, b) => b - a)[0]);
      }

      current.coords.forEach(([x, y]) => {
        filled.add(y * width + x);

        if (y > wave[x]) {
          wave[x] = y;
        }
      });

      settled.push(current);

      const [top] = wave.slice(0).sort((a, b) => b - a);

      if (delta[key] === top - initialTop) {
        const extendedKey = `${key}.${top - initialTop}`;

        if (cache.has(extendedKey)) {
          if (cache.size > 0 && cycle.length < cache.size) {
            cycle.push({ key, delta: top - initialTop });
          }
        } else {
          cycle.length = 0;
          cache.add(extendedKey);
        }
      }

      delta[key] = top - initialTop;

      current = createRock(rockTypeIt.next()[1], top + gap);
    }
  }

  /**
   * Part Two
   */
};

if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/${filename}.example.in`);
  console.log("---");
}

await solve(`./input/${filename}.in`);
