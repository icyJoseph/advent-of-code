const input = await Deno.readTextFile("./input/day-21.in");
// const input = await Deno.readTextFile("./input/example.in");

function* createDice(): Generator<number, number, number> {
  let i = 0;

  while (1) {
    yield i + 1;
    i = (i + 1) % 100;
  }

  // keep ts happy
  return i;
}

const wrapped = (...args: number[]) => {
  let total = args.reduce((a, b) => a + b, 0);

  while (total > 10) {
    total = total - 10;
  }

  return total;
};

/**
 * Part One
 */

const scores = [0, 0];

const dice = createDice();

let rolls = 0;

let player = 0;

const start = input
  .split("\n")
  .map((p) => p.split(": ")[1])
  .map(Number);

const positions = [...start];

while (1) {
  if (scores.some((n) => n >= 1000)) {
    break;
  }

  const next = [dice.next().value, dice.next().value, dice.next().value];

  rolls += 3;

  positions[player] = wrapped(positions[player], ...next);

  scores[player] += positions[player];

  player = (player + 1) % 2;
}

console.log("Part One:", Math.min(...scores) * rolls);

/**
 * Part Two
 */

console.group("Multiverse");

console.log("Fork counting approach");
let begin = performance.now();

const base = [1, 2, 3];
const futures = Object.entries(
  base
    .map((current, _, src) => src.map((other) => [current, other]))
    .map((partial) =>
      base.map((next) => partial.map((state) => [...state, next]))
    )
    .flat(2)
    .reduce((prev: Record<number, number>, curr) => {
      const tripleRoll = curr.reduce((a, b) => a + b, 0);
      return { ...prev, [tripleRoll]: (prev[tripleRoll] || 0) + 1 };
    }, {})
).map(([tripleRoll, frequency]) => [Number(tripleRoll), frequency]);

const createInitialState = () => [
  { score: 0, position: start[0] },
  { score: 0, position: start[1] }
];

type State = ReturnType<typeof createInitialState>;

const branchState = (state: State) => state.map((c) => ({ ...c }));

const playerWins = [0, 0];

const winningScore = 21;

function fork(
  turn: number,
  state: State,
  scoreDelta: number,
  universes: number
): void {
  const player = state[turn];

  const nextPosition = wrapped(player.position, scoreDelta);
  const nextScore = player.score + nextPosition;

  if (nextScore >= winningScore) {
    playerWins[turn] += universes;
    return;
  }

  state[turn] = { score: nextScore, position: nextPosition };

  for (const [scoreDelta, branches] of futures) {
    const snapshot = branchState(state);
    fork((turn + 1) % 2, snapshot, scoreDelta, universes * branches);
  }
}

for (const [scoreDelta, branches] of futures) {
  fork(0, createInitialState(), scoreDelta, branches);
}

console.log("Part Two:", Math.max(...playerWins));
console.log("Done in:", (performance.now() - begin) / 1000, "secs");

/**
 * Part Two - fast approach
 */

console.log("\n");
console.log("Caching Approach");
begin = performance.now();

const [startA, startB] = input
  .split("\n")
  .map((p) => p.split(": ")[1])
  .map(Number);

let turn = 0;

let p1 = 0;
let p2 = 0;

let table: Record<string, number> = {
  [`0.0.${startA}.${startB}.${turn}`]: 1
};

while (1) {
  let updates = 0;
  let keys = Object.keys(table);

  if (keys.length === 0) break;

  for (const key of keys) {
    if (table[key] === 0) continue;
    updates += 1;
    const [score0, score1, pos0, pos1, local] = key.split(".").map(Number);

    if (local !== turn) continue;

    for (let roll0 = 1; roll0 <= 3; roll0++) {
      for (let roll1 = 1; roll1 <= 3; roll1++) {
        for (let roll2 = 1; roll2 <= 3; roll2++) {
          let next_pos = wrapped(
            turn === 0 ? pos0 : pos1,
            roll0 + roll1 + roll2
          );

          const next_score = next_pos + (turn === 0 ? score0 : score1);

          if (next_score >= winningScore) {
            if (turn === 0) {
              p1 += table[key];
            } else {
              p2 += table[key];
            }

            continue;
          }

          const state =
            turn === 0
              ? `${next_score}.${score1}.${next_pos}.${pos1}.${(turn + 1) % 2}`
              : `${score0}.${next_score}.${pos0}.${next_pos}.${(turn + 1) % 2}`;

          table[state] = table[state] || 0;

          table[state] = table[state] + table[key];
        }
      }
    }

    table[key] = 0;
  }

  if (updates === 0) break;

  turn = (turn + 1) % 2;
}

/**
 * Part Two
 */
console.log("Part Two:", Math.max(p1, p2));

console.log("Done in:", (performance.now() - begin) / 1000, "secs");

console.groupEnd();
