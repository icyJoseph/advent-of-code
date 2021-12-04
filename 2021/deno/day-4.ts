const input = await Deno.readTextFile("./input/day-4.in");

const blocks = input.split("\n\n");

const [numbers, ...rest] = blocks;

const sequence = numbers.split(",").map(Number);

type Listener = (next: number) => void;

type Game = {
  subscribeEntry: (listener: Listener) => void;
  connectCard: (card: Card) => void;
  [Symbol.iterator]: () => {
    next: () => { value: number[]; done: boolean };
  };
};

const createGame = (sequence: number[]): Game => {
  let cursor = 0;

  const listeners: Listener[] = [];

  let cards: Card[] = [];

  return {
    subscribeEntry(listener: Listener) {
      listeners.push(listener);
    },
    connectCard(card: Card) {
      cards.push(card);
    },
    [Symbol.iterator]: () => {
      return {
        next() {
          const current = sequence[cursor];

          listeners.forEach((listener) => listener(current));

          const scores = [];

          for (const card of cards) {
            if (card.wins) {
              scores.push(card.cardScore() * current);
              card.discard();
            }
          }

          cards = cards.filter((card) => !card.discarded);

          cursor = cursor + 1;

          return { value: scores, done: cursor === sequence.length };
        }
      };
    }
  };
};

type Entry = ReturnType<typeof createEntry>;

const createEntry = (currentGame: Game, value: number) => {
  let checked = false;

  currentGame.subscribeEntry((next: number) => {
    if (next === value) {
      checked = true;
    }
  });

  return {
    get checked() {
      return checked;
    },
    value
  };
};

const isChecked = ({ checked }: Entry) => checked;

const entrySum = (prev: number, { value, checked }: Entry) =>
  checked ? prev : prev + value;

type Card = {
  wins: boolean;
  cardScore: () => number;
  discard: () => void;
  discarded: boolean;
};

const createCard = (seed: Entry[][]): Card => {
  const rows = seed.map((row) => row);
  const cols = seed.map((_, index) => seed.map((row) => row[index]));

  let discarded = false;

  return {
    discard() {
      discarded = true;
    },
    get discarded() {
      return discarded;
    },
    get wins() {
      return (
        rows.some((row) => row.every(isChecked)) ||
        cols.some((col) => col.every(isChecked))
      );
    },
    cardScore() {
      return rows.reduce((prev, row) => prev + row.reduce(entrySum, 0), 0);
    }
  };
};

const game = createGame(sequence);

const cards = rest.map((block) =>
  createCard(
    block.split("\n").map((row) =>
      row
        .split(" ")
        .filter(Boolean)
        .map(Number)
        .map((value) => createEntry(game, value))
    )
  )
);

cards.forEach((card) => game.connectCard(card));

const [first, ...others] = [...game].flat(1);
const [last] = others.slice(-1);

/**
 * Part One
 */

console.log("Part One:", first);

/**
 * Part Two
 */

console.log("Part Two:", last);
