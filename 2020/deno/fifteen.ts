const input = await Deno.readTextFile("./input/fifteen.in").then((res) =>
  res.split(",").map(Number)
);

/**
 * Helpers
 */

const memoryGame = (limit: number) => {
  const map = new Map<number, number[]>();

  input.forEach((num, it) => map.set(num, [it + 1, it + 1]));

  let it = input.length + 1;
  let [last] = input.slice(-1);

  while (1) {
    const [x1 = 0, x0 = x1]: number[] = map.get(last) ?? [it, it];
    const speak = x0 - x1;

    const queue = map.get(speak) ?? [it, it];

    map.set(speak, [queue[1], it]);

    if (it === limit) return speak;

    last = speak;
    it = it + 1;
  }
};

/**
 * Part One
 */

console.log("Part One:", memoryGame(2020));

/**
 * Part Two
 */

console.time("2");
console.log("Part Two:", memoryGame(30_000_000));

console.timeEnd("2");
