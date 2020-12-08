const input = await Deno.readTextFile("./input/eight.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

type State = { index: number; acc: number };
type Action = { name: "acc" | "jmp" | "nop"; value: number };

function reducer({ index, acc }: State, { name, value }: Action) {
  switch (name) {
    case "acc":
      return { index: index + 1, acc: acc + value };
    case "jmp":
      return { index: index + value, acc };
    case "nop":
    default:
      return { index: index + 1, acc };
  }
}

const digest = (list: string[]) =>
  list.map((line) => {
    const [name, value] = line.split(" ");
    if (name === "acc" || name === "jmp" || name === "nop") {
      return { name, value: parseInt(value) } as const;
    }
    throw new Error("Unexpected instruction");
  });

const mutate = (index: number, instructions: Action[]) => {
  const copy = instructions[index];

  if (copy.name === "acc") return;

  instructions[index].name = copy.name === "nop" ? "jmp" : "nop";

  return;
};

/**
 * Part One
 */

let state = { index: 0, acc: 0 };
const instructions = digest(input);
const ran = new Set<number>();

while (1) {
  if (ran.has(state.index)) {
    break;
  }
  ran.add(state.index);
  state = reducer(state, instructions[state.index]);
}

console.log("Part One:", state.acc);

/**
 * Part Two
 */

let modIndex = 0;

outer: while (1) {
  let state = { index: 0, acc: 0 };
  const instructions = digest(input);
  const ran = new Set();

  mutate(modIndex, instructions);

  inner: while (1) {
    if (state.index >= instructions.length) {
      console.log("Part Two:", state.acc);
      break outer;
    }

    if (ran.has(state.index)) {
      break inner;
    }

    ran.add(state.index);

    state = reducer(state, instructions[state.index]);
  }
  modIndex++;
}
