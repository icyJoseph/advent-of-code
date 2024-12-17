const isDebug = Deno.args.includes("--debug");
const log = console.log;

/**
 * Helpers
 */

const solve = (input: string, ans: Answer) => {
  type Registers = { A: bigint; B: bigint; C: bigint };

  function getCombo(lit: bigint, registers: Registers) {
    if (lit === 7n) throw new Error("invalid");
    if (0n <= lit && lit <= 3n) return lit;

    if (lit === 4n) return registers.A;
    if (lit === 5n) return registers.B;
    if (lit === 6n) return registers.C;

    throw new Error("invalid");
  }

  const [regs, prog] = input.split("\n\n");
  const registers = regs
    .split("\n")
    .map((row) => {
      const [label, value] = row.split(": ");

      return { label: label.replace("Register ", ""), value: BigInt(value) };
    })
    .reduce((acc, curr) => {
      acc[curr.label as "A" | "B" | "C"] = curr.value;

      return acc;
    }, {} as Record<"A" | "B" | "C", bigint>);

  const program = prog.split(": ")[1].split(",").map(BigInt);

  function runProgram(registers: Registers, program: bigint[]): string {
    let pointer = 0;
    const output = [];

    while (true) {
      if (program[pointer] == null) break;

      const cmd = program[pointer];
      const literal = program[pointer + 1];

      const combo = getCombo(literal, registers);

      switch (cmd) {
        case 0n: {
          const num = registers.A;
          const den = 2n ** combo;
          const div = num / den;

          registers.A = div;
          break;
        }
        case 6n: {
          const num = registers.A;
          const den = 2n ** combo;
          const div = num / den;

          registers.B = div;
          break;
        }

        case 7n: {
          const num = registers.A;
          const den = 2n ** combo;
          const div = num / den;

          registers.C = div;
          break;
        }

        case 1n: {
          const xor = registers.B ^ literal;

          registers.B = xor;
          break;
        }

        case 2n: {
          const mod = combo % 8n;

          registers.B = mod;
          break;
        }

        case 3n: {
          // jmp
          if (registers.A !== 0n) {
            pointer = Number(literal);
            continue;
          }

          break;
        }

        case 4n: {
          const xor = registers.B ^ registers.C;

          registers.B = xor;
          break;
        }

        case 5n: {
          const mod = combo % 8n;
          output.push(mod);
          break;
        }
      }

      pointer += 2;
    }

    return output.join(",");
  }

  /**
   * Part One
   */
  ans.p1 = runProgram({ ...registers }, program);

  /**
   * Part Two
   */
  const expected = program.join(",");

  let seed = 0n;
  let it = 0n;

  while (true) {
    const partial = runProgram({ ...registers, A: seed }, program);

    if (expected.endsWith(partial)) {
      if (expected === partial) break;
      seed = it + seed * 8n;
      it++;
    } else {
      it = 0n;
      seed++;
    }
  }

  ans.p2 = seed;
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  log("-- Day", filename, "--");

  const path = isExample ? "./input/example.in" : `./input/${filename}.in`;
  const input = await Deno.readTextFile(path);

  const ans: Answer = { p1: 0, p2: 0 };

  if (isExample) log("Example");

  solve(input, ans);

  console.log("Part 1:", ans.p1);
  console.log("Part 2:", ans.p2);

  log("-- Done --");
}

type Answer = { p1: unknown; p2: unknown };

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);
