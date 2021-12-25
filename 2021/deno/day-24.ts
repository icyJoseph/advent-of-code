const input = await Deno.readTextFile("./input/day-24.in");

type Instruction = { type: string; args: string[] };

const commands = input.split("\n");

const process: Instruction[] = commands.map((cmd) => {
  const [type, ...args] = cmd.split(" ");
  return { type, args };
});

const createRegister = (z: number): Record<string, number> => ({
  w: 0,
  x: 0,
  y: 0,
  z
});

type Register = ReturnType<typeof createRegister>;

const operations = (
  type: string,
  args: string[],
  register: Register,
  input: number
): Register => {
  switch (type) {
    case "inp": {
      const [loc] = args;
      return { ...register, [loc]: input };
    }
    case "add": {
      const [left, right] = args;
      const lop = register[left];
      const rop = register[right] ?? Number(right);

      return { ...register, [left]: lop + rop };
    }
    case "mul": {
      const [left, right] = args;
      const lop = register[left];
      const rop = register[right] ?? Number(right);

      return { ...register, [left]: lop * rop };
    }
    case "div": {
      const [left, right] = args;
      const lop = register[left];
      const rop = register[right] ?? Number(right);

      return { ...register, [left]: Math.floor(lop / rop) };
    }
    case "mod": {
      const [left, right] = args;
      const lop = register[left];
      const rop = register[right] ?? Number(right);

      return { ...register, [left]: lop % rop };
    }
    case "eql": {
      const [left, right] = args;
      const lop = register[left];
      const rop = register[right] ?? Number(right);

      return { ...register, [left]: lop === rop ? 1 : 0 };
    }
    default:
      throw new Error(`Operations: ${type}`);
  }
};

function execute_block(block: Instruction[], w: number, z = 0) {
  let register = createRegister(z);

  for (const inst of block) {
    register = operations(inst.type, inst.args, register, w);
  }

  return register.z;
}

const blocks: Instruction[][] = process.reduce(
  (prev: Instruction[][], curr) => {
    const last = prev.pop() || [];

    if (last.length === 18) {
      prev.push(last);
      return [...prev, [curr]];
    }

    last.push(curr);
    prev.push(last);

    return prev;
  },
  []
);

const allDigits = [9, 8, 7, 6, 5, 4, 3, 2, 1];

function search(
  index: number,
  blocks: Instruction[][],
  z: number,
  carry: number[],
  range = allDigits
): number[] {
  if (index === blocks.length) {
    return z === 0 ? carry : [];
  }

  let rng = range;

  const a0 = Number(blocks[index][4].args[1]);
  const a1 = Number(blocks[index][5].args[1]);

  if (a0 === 26) {
    const possible = (z % 26) + a1;

    if (possible <= 0 || possible > 9) {
      return [];
    } else {
      rng = [possible];
    }
  }

  for (const digit of rng) {
    const next = execute_block(blocks[index], digit, z);

    const result = search(index + 1, blocks, next, [...carry, digit], range);

    if (result.length > 0) return result;
  }

  return [];
}

/**
 * Part One
 */
console.log("Part One:", search(0, blocks, 0, []).join(""));

/**
 * Part Two
 */
console.log(
  "Part Two:",
  search(0, blocks, 0, [], allDigits.slice(0).reverse()).join("")
);
