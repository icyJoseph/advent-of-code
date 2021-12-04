const input = await Deno.readTextFile("./input/day-4.in");

const blocks = input.split("\n\n");

/**
 * Part One
 */

const [numbers, ...rest] = blocks;

const sequence = numbers.split(",").map(Number);

type Entry = { value: number; checked: boolean };
type Card = Entry[][];

const cards = rest.map((block) =>
  block.split("\n").map((row) =>
    row
      .split(" ")
      .filter(Boolean)
      .map(Number)
      .map((value) => ({ checked: false, value }))
  )
);

// wins happens in rows and columns
const checkWin = (card: { checked: boolean; value: number }[][]) => {
  // check rows
  const rowWin = card.some((row) => row.every(({ checked }) => checked));

  if (rowWin) return rowWin;

  for (const index of [0, 1, 2, 3, 4]) {
    const colWin = card
      .map((row) => row[index])
      .every(({ checked }) => checked);

    if (colWin) return colWin;
  }

  return false;
};

let firstWinner: Card = [];
let lastWinner: Card = [];

let firstWinnerNumber = sequence[0];
let lastWinnerNumber = sequence[0];

const winners = new Set<Card>();

outer: for (const next of sequence) {
  lastWinnerNumber = next;

  const nonWinners = cards.filter((card) => !winners.has(card));

  for (const card of nonWinners) {
    card.forEach((row, rowIndex) =>
      row.forEach((entry, entryIndex) => {
        card[rowIndex][entryIndex].checked =
          entry.checked || entry.value === next;
      })
    );

    if (checkWin(card)) {
      if (firstWinner.length === 0) {
        firstWinner = card;
        firstWinnerNumber = next;
      }

      lastWinner = card;

      winners.add(card);

      if (winners.size === cards.length) {
        break outer;
      }
    }
  }
}

const checkedSum = (prev: number, { value, checked }: Entry) =>
  checked ? prev : prev + value;

const sum = (a: number, b: number) => a + b;

console.log(
  "Part One:",
  firstWinner.map((row) => row.reduce(checkedSum, 0)).reduce(sum, 0) *
    firstWinnerNumber
);

console.log(
  "Part Two:",
  lastWinner.map((row) => row.reduce(checkedSum, 0)).reduce(sum, 0) *
    lastWinnerNumber
);
