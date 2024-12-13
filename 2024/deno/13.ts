const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (isDebug) {
    console.log("Debug Mode Active");
  }

  /**
   * Part One
   */

  function parseButton(input: string) {
    const spec = input.split(": ")[1];
    const [xSpec, ySpec] = spec.split(", ");
    const x = xSpec.replace("X+", "");
    const y = ySpec.replace("Y+", "");

    return { x: Number(x), y: Number(y) };
  }

  function parsePrize(input: string) {
    const spec = input.split(": ")[1];
    const [xSpec, ySpec] = spec.split(", ");
    const x = xSpec.replace("X=", "");
    const y = ySpec.replace("Y=", "");

    return { x: Number(x), y: Number(y) };
  }

  const machines = input.split("\n\n").map((spec) => {
    const [A, B, Prize] = spec.split("\n");

    return { A: parseButton(A), B: parseButton(B), Prize: parsePrize(Prize) };
  });

  function solveByForce(machine: (typeof machines)[number]) {
    const Ax = machine.A.x;
    const Ay = machine.A.y;
    const Bx = machine.B.x;
    const By = machine.B.y;
    const Px = machine.Prize.x;
    const Py = machine.Prize.y;

    let A = 0;
    let B = 0;

    while (true) {
      if (Bx * B < Px || By * B < Py) {
        B++;
      } else {
        break;
      }
    }

    let solved = false;
    while (true) {
      A++;
      const reset = B;
      while (B > 0) {
        if (Ax * A + Bx * B === Px && Ay * A + By * B === Py) {
          solved = true;
          break;
        }
        B--;

        if (B < 0) {
          break;
        }
      }
      if (solved) break;
      B = reset;
      if (A > 100) break;
    }
    if (!solved) return 0;
    if (B < 0) return 0;

    return A * 3 + B;
  }

  console.log("Part 1:", machines.map(solveByForce).reduce(sum));

  /**
   * Part Two
   */
  const ERROR = 10_000_000_000_000;
  const modMachines = machines.map((m) => ({
    ...m,
    Prize: { x: m.Prize.x + ERROR, y: m.Prize.y + ERROR },
  }));

  function solve(machine: (typeof machines)[number]) {
    const Ax = machine.A.x;
    const Ay = machine.A.y;
    const Bx = machine.B.x;
    const By = machine.B.y;
    const Px = machine.Prize.x;
    const Py = machine.Prize.y;

    /**
     * let m be A button presses,
     * let n, be B button presses,
     * let F, be the min tokens to find,
     * and the Axy, Bxy, Pxy notations are used to group two equations into one
     *
     * 1) Axy * m + Bxy * n = Pxy
     * 2) 3 * m + n = F
     * -> n = F - 3 * m
     * - replace n back in 1: Axy * m + Bxy * (F - 3 * m) = Pxy
     *  -> F = (Pxy - m * Axy + 3 * m * Bxy) / Bxy
     * - un-grouping equations:
     *  -> F = (Px - m * Ax + 3 * m * Bx) / Bx
     *  -> F = (Py - m * Ay + 3 * m * By) / By
     * - Equal sides
     *  -> Px * By - m * Ax * By + 3 * m * Bx * By = Py * Bx - m * Ay * Bx + 3 * m * Bx * By
     * - Simplify and regroup
     *  -> m * (Ay * Bx - Ax * By) = Py * Bx - Px * By
     *  -> m = (Py * Bx - Px * By) / (Ay * Bx - Ax * By)
     */
    const m = Math.ceil((Py * Bx - Px * By) / (Ay * Bx - Ax * By));
    // Reverse solve for B with a given A to reach Px
    const n = Math.ceil((Px - m * Ax) / Bx);

    // Verify
    if (m * Ax + n * Bx !== Px) return 0;
    if (m * Ay + n * By !== Py) return 0;
    // Solved
    return 3 * m + n;
  }

  console.log("Part 2:", modMachines.map(solve).reduce(sum));
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  console.log("Day", filename);

  if (isExample) {
    console.log("Example");
    await solve(`./input/example.in`);
    console.log("---");
  } else {
    await solve(`./input/${filename}.in`);
  }
}

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);
