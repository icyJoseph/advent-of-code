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

const indexReducer = length => (index, action) => {
  switch (action.type) {
    case NEW_STACK:
      const middle =
        length % 2 === 0 ? (length - 1) / 2 : Math.floor(length / 2);
      if (index < middle) {
        return middle + (middle - index);
      } else if (index > middle) {
        return middle + middle - index;
      }
      return index;
    case INCREMENT:
      const increment = action.payload;
      return (index * increment) % length;
    case CUT:
      const cut = Math.abs(action.payload);
      if (action.payload < 0) {
        const offset = length - cut;
        if (index < cut) {
          return index + cut;
        }
        return index - offset;
      } else {
        if (index < cut) {
          // index inside the cut
          return length - cut + index;
        }
        return index - cut;
      }
  }
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_twentytwo.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

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

    const length = 10007 || 119_315_717_514_047;
    const total = 1 || 101_741_582_076_661;

    let iteration = 0;
    let result;

    const reducer = indexReducer(length);

    while (iteration < total) {
      //   if (iteration % 100 === 0) console.log(iteration);
      result = actions.reduce((prev, action) => {
        return reducer(prev, action);
      }, 2019);

      iteration = iteration + 1;
    }

    console.log({ result });

    // part one: 7860
  }
);
