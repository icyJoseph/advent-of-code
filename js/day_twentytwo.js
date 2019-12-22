const fs = require("fs");
const path = require("path");

const NEW_STACK = "deal into new stack";
const INCREMENT = "deal with increment";
const CUT = "cut";

const dealWithIncrement = (deck, increment) => {
  let newDeck = [];
  let pointer = 0;

  let index = 0;

  while (index < deck.length) {
    newDeck[pointer % deck.length] = deck[index];

    pointer = pointer + increment;
    index = index + 1;
  }
  return newDeck;
};

const reducer = (deck, action) => {
  const copy = [...deck];
  switch (action.type) {
    case NEW_STACK:
      return copy.reduce((prev, curr) => [curr, ...prev], []);
    case INCREMENT:
      return dealWithIncrement(copy, action.payload);
    case CUT:
      const cut = Math.abs(action.payload);
      if (action.payload < 0) {
        // cut from the bottom to the top
        const offset = copy.length - cut;

        return copy
          .slice(offset)
          .concat(copy.slice(0, offset))
          .flat();
      }

      return copy
        .slice(cut)
        .concat(copy.slice(0, cut))
        .flat();
  }
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_twentytwo.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const length = 10007;
    // still ordered from 0 to 10006

    const deck = Array.from({ length }, (_, i) => i);

    const instructions = data.split("\n");
    const actions = instructions.map(instruction => {
      if (instruction.includes(NEW_STACK)) {
        return { type: NEW_STACK, payload: null };
      }
      if (instruction.includes(INCREMENT)) {
        const [increment] = instruction.split(" ").slice(-1);
        return { type: INCREMENT, payload: parseInt(increment) };
      }
      if (instruction.includes(CUT)) {
        const [cut] = instruction.split(" ").slice(-1);
        return { type: CUT, payload: parseInt(cut) };
      }
    });

    const newDeck = actions.reduce(
      (prev, curr) => {
        const next = reducer(prev, curr);
        if (next.length !== deck.length) {
          console.log(curr);
          throw new Error(`${curr.type} ${curr.payload}`);
        }
        return next;
      },
      [...deck]
    );

    console.log(newDeck);

    console.log(newDeck.indexOf(2019));
  }
);
