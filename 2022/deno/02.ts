const input = await Deno.readTextFile("./input/02.in");

const data = input.split("\n").map((game) => game.split(" "));

/**
 * Part One
 *
 *  A for Rock, B for Paper, and C for Scissors.
 *  X for Rock, Y for Paper, and Z for Scissors.
 *
 * (1 for Rock, 2 for Paper, and 3 for Scissors)
 * plus the score for the outcome of the round
 * (0 if you lost, 3 if the round was a draw, and 6 if you won).
 */

type Throw = "R" | "S" | "P";
type Result = "draw" | "win" | "lose";

const response: Readonly<Throw[]> = Object.freeze(["R", "S", "P"]);

const rotateLeft = <T>(list: Readonly<T[]>, times: number): T[] => {
  if (times === 0) return list.slice(0);

  return rotateLeft(list.slice(1).concat(list[0]), times - 1);
};

const normal = (str: string): Throw => {
  if (str === "A" || str === "X") return "R";
  if (str === "B" || str === "Y") return "P";
  if (str === "C" || str === "Z") return "S";
  throw new Error("invalid");
};

const score = (hand: Throw) => {
  switch (hand) {
    case "R":
      return 1;
    case "P":
      return 2;
    case "S":
      return 3;
  }
};

const gameScore = (result: Result, move: Throw) => {
  switch (result) {
    case "win":
      return 6 + score(move);
    case "draw":
      return 3 + score(move);
    case "lose":
      return 0 + score(move);
  }
};

const calcResult = (self: Throw, other: Throw): Result => {
  const rotations = other === "P" ? 2 : other === "S" ? 1 : 0;

  const rotated = rotateLeft(response, rotations);

  const result = rotated.indexOf(self);

  return result === 2 ? "win" : result === 1 ? "lose" : "draw";
};

const naiveStrategy = data.reduce((prev, curr) => {
  const [other, self] = curr;

  const hand = normal(self);
  const result = calcResult(hand, normal(other));

  return prev + gameScore(result, hand);
}, 0);

console.log("Part one:", naiveStrategy);

/**
 * Part Two
 *
 * "Anyway, the second column says how the round needs to end:
 * X means you need to lose,
 * Y means you need to end the round in a draw,
 * and Z means you need to win. Good luck!"
 */

const calcStrategy = (input: string): Result => {
  if (input === "X") return "lose";
  if (input === "Y") return "draw";
  if (input === "Z") return "win";

  throw new Error("Invalid input strategy");
};

const calcResponse = (move: Throw, wanted: Result): Throw => {
  // for R, response[0] draw, response[1] lose, response[2] wins
  const result = wanted === "win" ? 2 : wanted === "lose" ? 1 : 0;

  switch (move) {
    case "R":
      return rotateLeft(response, 0)[result];
    case "S":
      return rotateLeft(response, 1)[result];
    case "P":
      return rotateLeft(response, 2)[result];
  }
};

const moveStrategy = data.reduce((prev, curr) => {
  const [other, self] = curr;
  const strategy = calcStrategy(self);
  const response = calcResponse(normal(other), strategy);

  return prev + gameScore(strategy, response);
}, 0);

console.log("Part two:", moveStrategy);
