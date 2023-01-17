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
        index = (index + 1) % list.length;
        return value;
      },
    };
  };

  const width = 7; // |..@@@@.|
  const floor = 0;
  const gap = 3 + 1;

  const rockTypeIt = makeIterator(rockCycle);
  const jetsIt = makeIterator(jetsCycle);

  let current = createRock(rockTypeIt.next(), floor + gap);

  const filled = new Set<number>();

  type Rock = ReturnType<typeof createRock>;
  const settled: Rock[] = [];

  const limit = 2022;

  const wave = [0, 0, 0, 0, 0, 0, 0];

  while (settled.length < limit) {
    const jet = jetsIt.next();

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

    if (hitsFloor || hitsFilled) {
      // undo
      current.move({ left: 0, down: 1 });
      // settle
      current.setSettled();
    }

    if (current.isSettled()) {
      current.coords.forEach(([x, y]) => {
        filled.add(y * width + x);

        if (y > wave[x]) {
          wave[x] = y;
        }
      });

      settled.push(current);

      const [top] = wave.slice(0).sort((a, b) => b - a);

      current = createRock(rockTypeIt.next(), top + gap);
    }
  }

  /**
   * Part One
   */

  console.log(
    "Part one:",
    settled.map((rock) => rock.top).sort((a, b) => b - a)[0]
  );

  /**
   * Part Two
   *
   * Available at 17-2.ts
   */
};

if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/${filename}.example.in`);
  console.log("---");
}

await solve(`./input/${filename}.in`);
