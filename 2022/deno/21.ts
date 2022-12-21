const [__filename_ext] = new URL("", import.meta.url).pathname
  .split("/")
  .slice(-1);
const filename = __filename_ext.replace(".ts", "");

const solve = async (example = false) => {
  const input = await Deno.readTextFile(
    `./input/${example ? "example" : filename}.in`
  );

  if (example) {
    console.log("Example", filename);
  }

  type Monkey =
    | { name: string; number: number }
    | {
        name: string;
        operation: {
          left: string | Monkey;
          right: string | Monkey;
          op: string;
        };
      };

  const data: () => Record<string, Monkey> = () =>
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

  const evaluate = (monkey: Monkey): number => {
    if ("number" in monkey) return monkey.number;

    const left = monkey.operation.left;
    const right = monkey.operation.right;

    if (typeof left === "string") {
      throw new Error("left monkey was a string");
    }

    if (typeof right === "string") {
      throw new Error("right monkey was a string");
    }

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

  const monkeys = data();

  const root = replace(monkeys["root"], monkeys);

  console.log("Part one:", evaluate(root));

  /**
   * Part Two
   */

  const extMonkeys = data();

  const extRoot = extMonkeys["root"];
  const human = extMonkeys["humn"] as { name: string; number: number };
  if ("operation" in extRoot) {
    extRoot.operation.op = "=";
  }

  replace(extRoot, extMonkeys);

  let delta = example ? 100 : 1_000_000_000_000;
  let resultSign = null;
  let pointer = delta;

  while (true) {
    human.number = pointer;

    const result = evaluate(extRoot);

    if (resultSign == null) {
      resultSign = Math.sign(result);
    }
    const shouldFlip = resultSign !== Math.sign(result);

    if (shouldFlip) {
      resultSign = Math.sign(result);
      // change directions
      const sign = Math.sign(delta) * -1;
      const mag = Math.abs(delta);
      // change magnitude
      delta = (sign * mag) / 10;
    }
    if (result === 0) {
      console.log("Part two:", pointer);
      break;
    }

    pointer += delta;
  }
};

await solve(true);
console.log("---");
await solve();
