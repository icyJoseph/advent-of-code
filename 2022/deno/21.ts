const [__filename_ext] = new URL("", import.meta.url).pathname
  .split("/")
  .slice(-1);
const filename = __filename_ext.replace(".ts", "");

const solve = async (pathname: string) => {
  const input = await Deno.readTextFile(pathname);

  type Input = { name: string; number: number };
  type Computation = {
    name: string;
    operation: {
      left: string | Monkey;
      right: string | Monkey;
      op: string;
    };
  };

  type Monkey = Input | Computation;

  const monkeyGen = (input: string): Record<string, Monkey> =>
    input
      .split("\n")
      .map((row) => {
        const [name, operation] = row.split(": ");

        const maybeNum = Number(operation);
        if (isNaN(maybeNum)) {
          const [left, op, right] = operation.split(" ");
          return { name, operation: { left, right, op } };
        }
        return { name, number: maybeNum };
      })

      .reduce<Record<string, Monkey>>((prev, monkey) => {
        prev[monkey.name] = monkey;
        return prev;
      }, {});

  const replace = (monkey: Monkey, dict: Record<string, Monkey>) => {
    if ("operation" in monkey) {
      const left = monkey.operation.left;
      const right = monkey.operation.right;

      // if left is a computing monkey replace its arms

      if (typeof left === "string") {
        monkey.operation.left = replace(dict[left], dict);
      }

      if (typeof right === "string") {
        monkey.operation.right = replace(dict[right], dict);
      }
    }

    return monkey;
  };

  const replaceFromRoot = (dict: Record<string, Monkey>) => {
    const root = dict["root"];

    return replace(root, dict) as Computation;
  };

  const evaluate = (monkey: Monkey): number => {
    if ("number" in monkey) return monkey.number;

    const left = monkey.operation.left;
    const right = monkey.operation.right;

    if (typeof left === "string") throw new Error("left monkey was a string");

    if (typeof right === "string") throw new Error("right monkey was a string");

    switch (monkey.operation.op) {
      case "+":
        return evaluate(left) + evaluate(right);
      case "-":
        return evaluate(left) - evaluate(right);
      case "/":
        return evaluate(left) / evaluate(right);
      case "*":
        return evaluate(left) * evaluate(right);
      case "=":
        // last monkey should yell 0
        return evaluate(left) - evaluate(right);
      default:
        throw new Error("invalid op");
    }
  };

  /**
   * Part One
   */

  console.log("Part one:", evaluate(replaceFromRoot(monkeyGen(input))));

  /**
   * Part Two
   */

  const monkeys = monkeyGen(input);

  const root = replaceFromRoot(monkeys);
  root.operation.op = "=";

  const search = (monkey: Monkey, monkeys: Record<string, Monkey>) => {
    const human = monkeys["humn"] as Input;

    let delta = 1_000_000_000_000;

    human.number = delta;
    let result = evaluate(monkey);
    let prevResult = result;

    while (result) {
      const zeroCross = Math.sign(prevResult) !== Math.sign(result);

      if (zeroCross) {
        // change directions
        const sign = Math.sign(delta) * -1;
        // change magnitude to get closer to the zero-cross
        delta = (sign * Math.abs(delta)) / 10;
      }

      if (Math.abs(result) > Math.abs(prevResult)) {
        // result is shooting up
        // change directions
        const sign = Math.sign(delta) * -1;
        delta = sign * Math.abs(delta);
      }

      human.number += delta;

      [prevResult, result] = [result, evaluate(monkey)];
    }

    return human.number;
  };

  console.log("Part two:", search(root, monkeys));
};

if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/${filename}.example.in`);
  console.log("---");
}

await solve(`./input/${filename}.in`);
