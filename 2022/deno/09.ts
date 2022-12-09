const input = await Deno.readTextFile("./input/09.in");

const data = input.split("\n");

/**
 * Part One
 */

const moves = data
  .map((row) => row.split(" "))
  .map(([key, value]) => [key, Number(value)] as const);

const asKey = (coord: number[]) => `${coord[0]}.${coord[1]}`;

const distance = (head: number[], tail: number[]) => {
  const delta = [head[0] - tail[0], head[1] - tail[1]];

  return Math.abs(delta[0]) + Math.abs(delta[1]);
};

const calcMove = (head: number[], tail: number[]) => {
  const delta = [head[0] - tail[0], head[1] - tail[1]];
  const dx = delta[0];
  const dy = delta[1];

  return [dx === 0 ? dx : Math.sign(dx), dy === 0 ? dy : Math.sign(dy)];
};

const isTouching = (head: number[], tail: number[]) => {
  const dist = distance(head, tail);

  if (dist < 0) throw new Error("Negative distance");

  if (dist > 2) return false;

  if (dist === 2) {
    const delta = [head[0] - tail[0], head[1] - tail[1]];

    // same x
    if (delta[0] === 0) return false;
    // same y
    if (delta[1] === 0) return false;
  }

  return true;
};

const countUniqueTailPositions = (rope: number[][]) => {
  // x, y
  const tail = rope[rope.length - 1];
  const [head, ...rest] = rope;

  const tailSteps = new Set<string>();
  tailSteps.add(asKey(tail));

  moves.forEach((move) => {
    const [dir, steps] = move;

    for (const _ of Array.from({ length: steps })) {
      switch (dir) {
        case "U":
          head[1] = head[1] + 1;
          break;
        case "D":
          head[1] = head[1] - 1;
          break;
        case "L":
          head[0] = head[0] - 1;
          break;
        case "R":
          head[0] = head[0] + 1;
          break;
      }

      while (
        rest.some((curr, index) => {
          return !isTouching(rope[index], curr);
        })
      ) {
        rest.forEach((curr, index) => {
          const lead = rope[index];

          if (!isTouching(lead, curr)) {
            const [dx, dy] = calcMove(lead, curr);
            curr[0] = curr[0] + dx;
            curr[1] = curr[1] + dy;

            if (curr === tail) {
              tailSteps.add(asKey(curr));
            }
          }
        });
      }
    }
  });

  return tailSteps.size;
};

console.log(
  "Part one:",
  countUniqueTailPositions([
    [0, 0],
    [0, 0],
  ])
);

/**
 * Part Two
 */

const longRope = Array.from({ length: 10 }, () => [0, 0]);

console.log("Part two:", countUniqueTailPositions(longRope));
