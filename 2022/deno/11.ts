const input = await Deno.readTextFile("./input/11.in");

const data = input.split("\n\n");

const sum = (a: number, b: number) => a + b;
const mul = (a: number, b: number) => a * b;
const div = (a: number, b: number) => Math.floor(a / b);

type Monkey<Item = unknown> = {
  index: number;
  inspected: number;
  work: (monkeys: Monkey<Item>[]) => void;
  receive: (value: Item) => void;
};

const parseMonkey = (block: string) => {
  const [_, start, op, ...rest] = block.split("\n").map((n) => n.trim());

  const initial = start
    .replace("Starting items: ", "")
    .split(",")
    .map((n) => n.trim())
    .map(Number);

  const [left, type, right] = op.replace("Operation: new = ", "").split(" ");

  const nLeft = Number(left);
  const nRight = Number(right);

  const leftArg = isNaN(nLeft) ? left : Number(nLeft);
  const rightArg = isNaN(nRight) ? right : Number(nRight);

  const operator = type === "+" ? sum : mul;

  const remFactor = Number(rest[0].replace("Test: divisible by ", ""));

  const ifTrue = Number(rest[1].replace("If true: throw to monkey ", ""));
  const ifFalse = Number(rest[2].replace("If false: throw to monkey ", ""));

  return { initial, leftArg, rightArg, operator, remFactor, ifTrue, ifFalse };
};

const mostInspected = <T>(list: Monkey<T>[], take: number) =>
  list
    .map((m) => m.inspected)
    .sort((a, b) => b - a)
    .slice(0, take);

const simulate =
  ({ rounds }: { rounds: number }) =>
  <T>(monkeys: Monkey<T>[]) => {
    for (let index = 0; index < rounds; index++) {
      for (const monkey of monkeys) {
        monkey.work(monkeys);
      }
    }

    return monkeys;
  };

/**
 * Part One
 */
const partOne = () => {
  type Item = number;

  type Message = { destination: number; value: Item };

  const createMonkey = (
    index: number,
    initial: number[],
    operation: (old: number) => number,
    test: (current: number) => Message,
    relief: number
  ): Monkey<number> => {
    const stack = [...initial];

    let inspected = 0;

    const work = (monkeys: Monkey<number>[]) => {
      stack.forEach((next) => {
        inspected += 1;

        next = operation(next);
        next = div(next, relief);
        const { destination, value } = test(next);

        monkeys[destination].receive(value);
      });

      stack.length = 0;
    };

    const receive = (item: number) => {
      stack.push(item);
    };

    const monkey: Monkey<number> = {
      index,
      work,
      receive,
      get inspected() {
        return inspected;
      },
    };

    return monkey;
  };

  const createMonkeys = (blocks: string[], relief: number) =>
    blocks.map((block, index) => {
      const {
        initial,
        leftArg,
        rightArg,
        operator,
        remFactor,
        ifTrue,
        ifFalse,
      } = parseMonkey(block);

      const operation = (old: Item) => {
        if (typeof leftArg === "string" && typeof rightArg === "string") {
          return operator(old, old);
        }

        if (typeof leftArg === "string" && typeof rightArg === "number") {
          return operator(old, rightArg);
        }

        return operator(old, old);
      };

      const test = (current: Item) => {
        if (current % remFactor === 0) {
          return { destination: ifTrue, value: current };
        }
        return { destination: ifFalse, value: current };
      };

      return createMonkey(index, initial, operation, test, relief);
    });

  const monkeys = simulate({ rounds: 20 })(createMonkeys(data, 3));

  return mostInspected(monkeys, 2).reduce(mul);
};

console.log("Part one:", partOne());

/**
 * Part Two
 */

const partTwo = () => {
  type Rems = Record<string, number>;

  type Message = { destination: number; value: Rems };

  type Monkey = {
    index: number;
    work: (monkeys: Monkey[]) => void;
    receive: (value: Rems) => void;
    inspected: number;
  };

  const createMonkey = (
    index: number,
    initial: Rems[],
    operation: (old: Rems) => Rems,
    test: (current: Rems) => Message
  ): Monkey => {
    const stack: Rems[] = [...initial];

    let inspected = 0;

    const work = (monkeys: Monkey[]) => {
      stack.forEach((next) => {
        inspected += 1;

        next = operation(next);

        const { destination, value } = test(next);

        const adjusted = Object.entries(value)
          .map(([f, v]) => [Number(f), v])
          .reduce<Rems>((acc, [factor, value]) => {
            acc[factor] = value % factor;

            return acc;
          }, {});

        monkeys[destination].receive(adjusted);
      });

      stack.length = 0;
    };

    const receive = (item: Rems) => {
      stack.push(item);
    };

    return {
      index,
      work,
      receive,
      get inspected() {
        return inspected;
      },
    };
  };

  const readRems = (blocks: string[]) =>
    blocks.map((block) => {
      const { remFactor } = parseMonkey(block);

      return remFactor;
    });

  const createMonkeys = (blocks: string[], rems: number[]) =>
    blocks.map((block, index) => {
      const {
        initial: start,
        leftArg,
        rightArg,
        operator,
        remFactor,
        ifTrue,
        ifFalse,
      } = parseMonkey(block);

      const initial = start.map((n) => {
        return rems.reduce<Rems>((prev, f) => {
          prev[f] = n % f;
          return prev;
        }, {});
      });

      const operation = (old: Rems) => {
        if (typeof leftArg === "string" && typeof rightArg === "string") {
          return Object.entries(old).reduce<Rems>((acc, [factor, value]) => {
            acc[factor] = operator(value, value) % Number(factor);

            return acc;
          }, {});
        }

        if (typeof leftArg === "string" && typeof rightArg === "number") {
          return Object.entries(old).reduce<Rems>((acc, [factor, value]) => {
            acc[factor] = operator(value, rightArg) % Number(factor);

            return acc;
          }, {});
        }

        throw new Error("Invalid args");
      };

      const test = (current: Rems) => {
        if (current[remFactor] === 0) {
          return { destination: ifTrue, value: current };
        }
        return { destination: ifFalse, value: current };
      };

      return createMonkey(index, initial, operation, test);
    });

  const monkeys = simulate({ rounds: 10_000 })(
    createMonkeys(data, readRems(data))
  );

  return mostInspected(monkeys, 2).reduce(mul);
};

console.log("Part two:", partTwo());
