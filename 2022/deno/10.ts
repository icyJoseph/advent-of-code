const input = await Deno.readTextFile("./input/10.in");

const data = input.split("\n").map((row) => row.split(" "));

/**
 * Part One
 */

const getCycleRunner = () => {
  const cycle = { current: 0 };
  const register = { current: 1 };

  const execute = ({
    cmd,
    afterEach,
  }: {
    cmd: [string, string];
    afterEach: (cycle: number, register: number) => void;
  }) => {
    const [inst, payload] = cmd;

    const times = inst === "noop" ? 1 : 2;

    Array.from({ length: times }).forEach(() => {
      cycle.current += 1;

      afterEach(cycle.current, register.current);
    });

    if (inst === "addx") {
      register.current += Number(payload);
    }
  };

  return { execute };
};

const findInteresting = () => {
  const { execute } = getCycleRunner();

  const interesting: number[] = [];

  const afterEach = (cycle: number, register: number) => {
    if (cycle % 40 === 20) {
      interesting.push(register * cycle);
    }
  };

  for (const [inst, payload] of data) {
    execute({ cmd: [inst, payload], afterEach });
  }

  return interesting;
};

console.log(
  "Part one:",
  findInteresting().reduce((a, b) => a + b)
);
/**
 * Part Two
 */

const getSprite = (x: number) => new Set([x - 1, x, x + 1]);

const fillScreen = (screen: string[][]) => {
  const { execute } = getCycleRunner();

  for (const [cmd, payload] of data) {
    // start cycle

    execute({
      cmd: [cmd, payload],
      afterEach: (cycle, register) => {
        const sprite = getSprite(register);
        const row = Math.floor((cycle - 1) / 40);
        const col = (cycle - 1) % 40;

        screen[row][col] = sprite.has(col) ? "#" : ".";
      },
    });
  }

  return screen;
};

const screen = Array.from({ length: 6 }, () =>
  Array.from({ length: 40 }, () => " ")
);

fillScreen(screen);

console.log("Part two:");
for (const row of screen) {
  console.log(row.join(""));
}
