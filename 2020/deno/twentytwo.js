const input = await Deno.readTextFile("./input/twentytwo.in").then((res) =>
  res.split("\n\n")
);

/**
 * Helpers
 */

const makeDecks = (raw) =>
  raw.map((row) => {
    const [, ...deck] = row.split("\n").map(Number);
    return deck;
  });

const score = (deck) =>
  deck
    .slice(0)
    .reverse()
    .reduce((prev, curr, index) => prev + curr * (index + 1), 0);

const game = ([deck1, deck2] = makeDecks(input)) => {
  const [top1, ...rest1] = deck1;
  const [top2, ...rest2] = deck2;

  if (top1 > top2) {
    const next1 = [...rest1, top1, top2];
    return winner([next1, rest2]);
  }
  const next2 = [...rest2, top2, top1];
  return winner([rest1, next2]);
};

const winner = ([deck1, deck2]) => {
  if (deck2.length === 0) {
    return deck1;
  } else if (deck1.length === 0) {
    return deck2;
  } else {
    return game([deck1, deck2]);
  }
};

/**
 * Part One
 */

const decks = makeDecks(input);

console.log("Part One:", score(game(decks)));

/**
 * Part Two
 */

const claim = (top1, top2, [deck1, deck2], winner = null) => {
  if (winner === 1) {
    deck1.push(top1, top2);
    return [deck1, deck2];
  } else if (winner === 2) {
    deck2.push(top2, top1);
    return [deck1, deck2];
  } else {
    if (top1 > top2) {
      deck1.push(top1, top2);
      return [deck1, deck2];
    }
    deck2.push(top2, top1);
    return [deck1, deck2];
  }
};

const trigger = (card, deck) => card <= deck.length;

const recursiveCombat = (decks = makeDecks(input)) => {
  let winner = null;
  let recursive = decks;
  const p1set = new Set();
  const p2set = new Set();

  let it = 0;
  while (it < Infinity) {
    const [p1, p2] = recursive;

    if (p1.length === 0) {
      // 2 wins
      return { recursive, winner: 2 };
    } else if (p2.length === 0) {
      //1 wins
      return { recursive, winner: 1 };
    }

    // first rule
    if (p1set.has(p1.join(",")) || p2set.has(p2.join(","))) {
      return { recursive, winner: 1 };
    }

    p1set.add(p1.join(","));
    p2set.add(p2.join(","));

    // second rule - draw
    const top1 = p1.shift();
    const top2 = p2.shift();

    // 3rd rule
    if (trigger(top1, p1) && trigger(top2, p2)) {
      // new game
      const cp1 = p1.slice(0, top1);
      const cp2 = p2.slice(0, top2);

      const subGame = recursiveCombat([cp1, cp2]);

      recursive = claim(top1, top2, [p1, p2], subGame.winner);
    } else {
      if (top1 > top2) {
        winner = 1;
      } else {
        winner = 2;
      }
      recursive = claim(top1, top2, [p1, p2], winner);
    }

    if (p1.length === 0) {
      // 2 wins
      return { recursive, winner: 2 };
    } else if (p2.length === 0) {
      //1 wins
      return { recursive, winner: 1 };
    }
    it = it + 1;
    // console.log({ round: it, winner });
  }
  return { recursive, winner };
};

const { recursive, winner: player } = recursiveCombat();
console.log("Part Two:", score(recursive[player - 1]));
