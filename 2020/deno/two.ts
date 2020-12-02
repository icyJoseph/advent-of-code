const input = await Deno.readTextFile("./input/two.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

type Policy = "range" | "1-index";

interface Base {
  password: string;
  chars: string[];
  letter: string;
}

interface ByIndex extends Base {
  first: string;
  second: string;
}

interface ByRange extends Base {
  min: number;
  max: number;
}

function consumeEntry(entry: string, passwordPolicy: "range"): ByRange;
function consumeEntry(entry: string, passwordPolicy: "1-index"): ByIndex;

function consumeEntry(
  entry: string,
  passwordPolicy: Policy
): ByRange | ByIndex {
  const [policy, password] = entry.split(": ");
  const [range, letter] = policy.split(" ");
  const [min, max] = range.split("-").map(Number);

  const chars = password.split("");

  if (passwordPolicy === "1-index") {
    return {
      first: chars[min - 1],
      second: chars[max - 1],
      letter,
      password,
      chars
    };
  }

  return { min, max, letter, password, chars };
}

/**
 * Part One
 */

const validWithFirstPolicy = input.filter((entry) => {
  const { min, max, letter, chars } = consumeEntry(entry, "range");
  const rank = chars.filter((char) => char === letter).length;

  return rank >= min && rank <= max;
});

console.log("Part One:", validWithFirstPolicy.length);

/**
 * Part Two
 */

const validWithSecondPolicy = input.filter((entry) => {
  const { first, second, letter } = consumeEntry(entry, "1-index");

  switch (true) {
    case first === letter && second !== letter:
      return true;
    case first !== letter && second === letter:
      return true;
    default:
      return false;
  }
});

console.log("Part Two:", validWithSecondPolicy.length); // 686
