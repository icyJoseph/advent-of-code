const input = await Deno.readTextFile("./input/five.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */
const front = "F";
const back = "B";
const left = "L";
const right = "R";

const rows = Array.from({ length: 128 }, (_, i) => i);
const columns = Array.from({ length: 8 }, (_, i) => i);

type Directions = typeof front | typeof back | typeof left | typeof right;

const partition = (arr: number[], type: Directions) => {
  switch (type) {
    case front:
    case left:
      return arr.slice(0, Math.floor(arr.length) / 2);
    case back:
    case right:
      return arr.slice(Math.floor(arr.length) / 2);
  }
};

const findSeat = (pass: string) => {
  const [row] = pass
    .slice(0, 7)
    .split("")
    .reduce((prev, curr) => partition(prev, curr as Directions), rows);

  const [col] = pass
    .slice(7)
    .split("")
    .reduce((prev, curr) => partition(prev, curr as Directions), columns);

  return { row, col, seatId: seatId({ row, col }) };
};

const seatId = ({ row, col }: { row: number; col: number }) => row * 8 + col;

/**
 * Part One
 */

const seats = input.map(findSeat);
console.log("Part One:", Math.max(...seats.map(({ seatId }) => seatId)));

/**
 * Part Two
 */

const seatBehind = seats
  .slice(0)
  .sort((a, b) => a.seatId - b.seatId)
  .filter((seat) => {
    const fwdLook = seats.find((fwd) => fwd.seatId === seat.seatId + 1);

    if (!fwdLook) return true;

    const backLook = seats.find((back) => back.seatId === seat.seatId - 1);

    if (!backLook) return true;

    return false;
  })
  .reduce((prev, curr, index, src) => {
    const next = src[index + 1];
    if (next) {
      if (next.seatId - curr.seatId > 2) return prev;
      return curr;
    }
    return prev;
  });

const mySeat = seatBehind.seatId + 1;

console.log("Part Two:", mySeat);
