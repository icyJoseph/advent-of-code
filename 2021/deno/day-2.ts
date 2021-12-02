const input = await Deno.readTextFile("./input/day-2.in");

const rows = input.split("\n");

let instructions = rows.map((row) => {
  const [key, value] = row.split(" ");

  return [key, Number(value)] as const;
});

/**
 * Part One
 */

const partOne = instructions.reduce(
  (prev, [dir, value]) => {
    switch (dir) {
      case "forward":
        return { ...prev, horizontal: prev.horizontal + value };
      case "down":
        return { ...prev, depth: prev.depth + value };
      case "up":
        return { ...prev, depth: prev.depth - value };
      default:
        return prev;
    }
  },
  { horizontal: 0, depth: 0 }
);

console.log("Part One:", partOne.horizontal * partOne.depth);

/**
 * Part Two
 */

const partTwo = instructions.reduce(
  (prev, [dir, value]) => {
    switch (dir) {
      case "forward":
        return {
          ...prev,
          horizontal: prev.horizontal + value,
          depth: prev.depth + prev.aim * value
        };
      case "down":
        return { ...prev, aim: prev.aim + value };
      case "up":
        return { ...prev, aim: prev.aim - value };
      default:
        return prev;
    }
  },
  { horizontal: 0, depth: 0, aim: 0 }
);

console.log("Part Two:", partTwo.horizontal * partTwo.depth);
