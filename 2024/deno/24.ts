const isDebug = Deno.args.includes("--debug");
const log = console.log;

/**
 * Helpers
 */

const solve = (input: string, ans: Answer) => {
  /**
   * Part One
   */

  const [initSpec, opsSpec] = input.split("\n\n");
  const initial = initSpec.split("\n").map<[string, number]>((row) => {
    const [cell, value] = row.split(": ");
    return [cell, Number(value)];
  });

  const x = new Set<string>();
  const y = new Set<string>();
  const z = new Set<string>();

  type Op = {
    lhs: string;
    op: string;
    rhs: string;
    result: string;
  } & {
    swap?: boolean;
  };

  const ops = opsSpec.split("\n").map<Op>((row) => {
    const [input, result] = row.split(" -> ");
    const [lhs, op, rhs] = input.split(" ");

    if (lhs.startsWith("x")) {
      x.add(lhs);
    }
    if (rhs.startsWith("x")) {
      x.add(rhs);
    }

    if (lhs.startsWith("y")) {
      y.add(lhs);
    }
    if (rhs.startsWith("y")) {
      y.add(rhs);
    }

    if (result.startsWith("z")) {
      z.add(result);
    }

    return { lhs, op, rhs, result };
  });

  // type Op = (typeof ops)[number] & { swap?: boolean };

  function getOutput(initial: Array<[string, number]>, inst: Op[]) {
    const wires = new Map<string, number>(initial);

    while (true) {
      inst.forEach((op) => {
        const lhs = wires.get(op.lhs);
        const rhs = wires.get(op.rhs);

        if (lhs == null) return;
        if (rhs == null) return;

        switch (op.op) {
          case "AND":
            wires.set(op.result, lhs && rhs);
            break;

          case "OR":
            wires.set(op.result, lhs || rhs);
            break;

          case "XOR":
            wires.set(op.result, lhs ^ rhs);
            break;
        }
      });

      if (
        [...z].every((entry) => {
          return wires.get(entry) != null;
        })
      ) {
        break;
      }
    }
    return wires;
  }

  const toBin = (n: Set<string>, table: Map<string, number>) =>
    [...n]
      .sort((a, b) => b.localeCompare(a))
      .map((w) => table.get(w))
      .join("");

  const toNumber = (n: Set<string>, table: Map<string, number>) => {
    return parseInt(toBin(n, table), 2);
  };

  ans.p1 += toNumber(z, getOutput(initial, ops));

  if (isExample) return;

  /**
   * Part Two
   */

  const OPS = {
    AND: "AND",
    XOR: "XOR",
    OR: "OR",
  };

  function findResult(left: string, right: string, op: string, graph: Op[]) {
    return graph.find((entry) => {
      if (entry.op !== op) return false;

      if (entry.lhs === left && entry.rhs === right) return true;

      if (entry.lhs === right && entry.rhs === left) return true;

      return false;
    });
  }

  function swap(from: string, to: string, graph: Op[]) {
    if (isDebug) console.count("swap");

    const source = graph.find((node) => node.result === from);
    assert(source);
    const dest = graph.find((node) => node.result === to);
    assert(dest);

    if (isDebug) console.log("b4:", { source }, { dest });

    [source.result, dest.result] = [dest.result, source.result];

    source.swap = true;
    dest.swap = true;

    if (isDebug) console.log("after:", { source }, { dest });
  }

  function repair(outputs: Set<string>, graph: Op[]) {
    let prev: Op;

    const zWires = [...outputs].sort();

    // the last z is just the carry of the previous circuit
    zWires.slice(0, -1).forEach((zWire) => {
      /**

      X + Y + prev = Z + next

      X
          XOR -> X_xor_Y
      Y                 XOR -> Z
                 prev

      X
        AND  -> X_and_Y
      Y
                                    OR -> next
      X_xor_Y
            AND -> X_xor_Y_and_prev
      prev

       */

      const xWire = zWire.replace("z", "x");
      const yWire = zWire.replace("z", "y");

      const X_and_Y = findResult(xWire, yWire, OPS.AND, graph);
      assert(X_and_Y, "unfixable AND");

      if (!prev) {
        // first circuit has no carry from a previous circuit
        // the next circuit receives, (X and Y) or ((X xor Y) and prev)
        // (X and Y) or ((X or Y) and 0) -> prev is 0
        // the next circuit gets (X and Y) as carry
        prev = X_and_Y;
        return;
      }

      const X_xor_Y = findResult(xWire, yWire, OPS.XOR, graph);
      assert(X_xor_Y, "unfixable XOR");

      let X_xor_Y_and_prev = findResult(
        prev.result,
        X_xor_Y.result,
        OPS.AND,
        graph
      );

      if (!X_xor_Y_and_prev) {
        swap(X_and_Y.result, X_xor_Y.result, graph);

        X_xor_Y_and_prev = findResult(
          prev.result,
          X_xor_Y.result,
          OPS.AND,
          graph
        );
      }

      assert(X_xor_Y_and_prev, "Unfixable XOR w/ prev");

      const Z = findResult(prev.result, X_xor_Y.result, OPS.XOR, graph);
      assert(Z, "Circuit goes nowhere");

      if (!Z.result.startsWith("z")) {
        // output doesn't go to a z
        // is it possible to make it go to a z?
        if (X_and_Y.result.startsWith("z")) {
          swap(X_and_Y.result, Z.result, graph);
        } else if (X_xor_Y_and_prev.result.startsWith("z")) {
          swap(X_xor_Y_and_prev.result, Z.result, graph);
        }
      }

      const carry = findResult(
        X_xor_Y_and_prev.result,
        X_and_Y.result,
        OPS.OR,
        graph
      );

      assert(carry, "outputs nowhere");

      // if the next is the last z
      // do not swap 🐛🐛🐛
      if (
        // the carry over, should not go to a z
        carry.result.startsWith("z") &&
        // unless it is the last one... 🐛🐛🐛
        carry.result !== zWires[zWires.length - 1]
      ) {
        swap(carry.result, Z.result, graph);
      }

      prev = carry;
    });
  }

  repair(z, ops);

  if (isDebug) {
    const state = getOutput(initial, ops);

    const xNum = toNumber(x, state);
    const yNum = toNumber(y, state);
    const zNum = toNumber(z, state);
    console.assert(zNum === xNum + yNum, "Something is not correct");
  }

  ans.p2 = ops
    .filter(({ swap }) => swap)
    .map(({ result }) => result)
    .toSorted()
    .join(",");
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  log("-- Day", filename, "--");

  const path = isExample ? "./input/example.in" : `./input/${filename}.in`;
  const input = await Deno.readTextFile(path);

  const ans: Answer = { p1: 0, p2: "" };

  if (isExample) log("Example");

  solve(input, ans);

  console.log("Part 1:", ans.p1);
  console.log("Part 2:", ans.p2);

  log("-- Done --");
}

type Answer = { p1: number; p2: string };

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);

function assert<T>(
  input: T | null | undefined,
  message = "</3"
): asserts input is T {
  if (input == null) throw new Error(message);
}
