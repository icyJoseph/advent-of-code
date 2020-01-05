const fs = require("fs");
const path = require("path");

const NEW_STACK = "deal into new stack";
const INCREMENT = "deal with increment";
const CUT = "cut";

const dealWithIncrement = (deck, increment) => {
  let newDeck = [];
  let pointer = 0n;

  let index = 0n;

  while (index < BigInt(deck.length)) {
    newDeck[pointer % deck.length] = deck[index];

    pointer = pointer + increment;
    index = index + 1n;
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
      const middle = length % 2n === 0n ? (length - 1n) / 2n : length / 2;
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
      if (action.payload < 0n) {
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

const inverseIndexReducer = length => (index, action) => {
  switch (action.type) {
    case NEW_STACK:
      return length - index - 1n;
    case INCREMENT:
      const increment = action.payload;
      let coef = 0n;
      let origin;
      while (1) {
        if ((coef * length + index) % increment === 0n) {
          origin = (coef * length + index) / increment;
          break;
        }
        coef = coef + 1n;
      }
      return origin;
    case CUT:
      const cut = Math.abs(action.payload);
      if (action.payload < 0n) {
        if (index < cut) {
          return index + length - cut;
        }
        return index - cut;
      } else {
        if (index < length - cut) {
          return cut + index - length;
        }
        return index + cut;
      }
  }
};

const linearEqReducer = length => ([a, b], action) => {
  switch (action.type) {
    case NEW_STACK:
      return [-a % length, (length - 1n - b) % length];
    case INCREMENT:
      const increment = action.payload;
      return [(a * increment) % length, (b * increment) % length];
    case CUT:
      const cut = action.payload;
      return [a % length, (b - cut) % length];
  }
};

const normal = length => val => {
  if (val < 0n) {
    return length - normal(length)(-val);
  }
  return val % length;
};

const dotProduct = length => (left, right) => {
  let result = [];
  for (let i = 0; i < left.length; i++) {
    result[i] = [];
    for (let j = 0; j < right[0].length; j++) {
      let sum = 0n;
      for (let k = 0; k < left[0].length; k++) {
        sum += (left[i][k] * right[k][j]) % length;
      }
      result[i][j] = sum % length;
    }
  }
  return result;
};

const inverse = length => (m, b, y) => {
  let k = 0n;
  let c;
  while (1) {
    c = k * length + (y - b);
    if (c % m === 0n) {
      break;
    }
    k = k + 1n;
  }
  // for length very large, this would take very long
  return normal(length)(c / m);
};

const fastInverse = length => m => {
  // https://www.cs.cmu.edu/~adamchik/21-127/lectures/congruences_print.pdf
  const bin = (length - 2n)
    .toString(2)
    .split("")
    .reverse();

  return bin
    .reduce(
      prev => {
        const [last] = prev.slice(-1);
        return [...prev, (last * last) % length];
      },
      [m]
    )
    .filter((_, i) => bin[i] === "1")
    .reduce((prev, curr) => (prev * curr) % length, 1n);
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_twentytwo.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);
    console.group("Part 1");
    const instructions = data.split("\n");

    const actions = instructions.map(instruction => {
      if (instruction.includes(NEW_STACK)) {
        return { type: NEW_STACK, payload: null };
      }
      if (instruction.includes(INCREMENT)) {
        const [increment] = instruction.split(" ").slice(-1);
        return { type: INCREMENT, payload: BigInt(increment) };
      }
      if (instruction.includes(CUT)) {
        const [cut] = instruction.split(" ").slice(-1);
        return { type: CUT, payload: BigInt(cut) };
      }
    });

    const small = 10007n;
    const large = 119_315_717_514_047n;

    const total = 101_741_582_076_661n;

    // part 1
    const reducer = linearEqReducer(small);

    const [m, b] = actions.reduce((prev, action) => reducer(prev, action), [
      1n,
      0n
    ]);

    const smallNormalizer = normal(small);
    const smallInverter = inverse(small);

    const x = 2019n;

    const y = smallNormalizer(x * m + b);

    const x_1 = smallInverter(m, b, y);

    // m transforms as k * m;
    // b transforms as p * b + q;
    const Am = [
      [m, 0n],
      [0n, 0n]
    ];

    const [, p_q] = actions.reduce((prev, action) => reducer(prev, action), [
      0n,
      1n
    ]);

    const q = b;
    const p = (p_q - q) % small;
    const Ab = [
      [p, q],
      [0n, 1n]
    ];

    const [[m_0]] = dotProduct(small)(Am, [[1n], [0n]]);
    const [[b_0]] = dotProduct(small)(Ab, [[0n], [1n]]);

    console.assert(m_0 === m);
    console.assert(b_0 === b);
    console.log(`Linear transform: ${m} * x + ${b}`);
    console.assert(x === x_1, `Inverse transform failed!`);
    console.log(`Card ${x_1} is now at position ${y}`);

    // proving that using matrices works

    const [m_2, b_2] = actions.reduce((prev, action) => reducer(prev, action), [
      m,
      b
    ]);

    const [m_3, b_3] = actions.reduce((prev, action) => reducer(prev, action), [
      m_2,
      b_2
    ]);

    const [m_4, b_4] = actions.reduce((prev, action) => reducer(prev, action), [
      m_3,
      b_3
    ]);

    const Am2 = dotProduct(small)(Am, Am);
    const Ab2 = dotProduct(small)(Ab, Ab);
    const Am4 = dotProduct(small)(Am2, Am2);
    const Ab4 = dotProduct(small)(Ab2, Ab2);
    const [[m_4_]] = dotProduct(small)(Am4, [[1n], [0n]]);
    const [[b_4_]] = dotProduct(small)(Ab4, [[0n], [1n]]);

    console.assert(m_4 === smallNormalizer(m_4_));
    console.assert(b_4 === smallNormalizer(b_4_));
    console.groupEnd();
    // part 2

    console.group("Part 2");
    const binary = BigInt(total)
      .toString(2)
      .split("")
      .reverse();

    const I = [
      [1n, 0n],
      [0n, 1n]
    ];

    const largeReducer = linearEqReducer(large);

    // calculate the linear transformation of M and B
    const [M, B] = actions.reduce(
      (prev, action) => largeReducer(prev, action),
      [1n, 0n]
    );

    // complement the calculation the linear transformation of B
    const [, P_Q] = actions.reduce(
      (prev, action) => largeReducer(prev, action),
      [0n, 1n]
    );

    // M varies with this matrix
    const AX = [
      [M, 0n],
      [0n, 0n]
    ];

    const Q = B;
    const P = (P_Q - Q) % large;

    // B varies with this matrix
    const AB = [
      [P, Q],
      [0n, 1n]
    ];

    // modular matrix multiplication
    const matrixMult = dotProduct(large);

    const mMatrices = binary
      .reduce(
        (prev, _) => {
          const [last] = prev.slice(-1);
          return [...prev, matrixMult(last, last)];
        },
        [AX]
      )
      .filter((_, index) => binary[index] === "1");

    const mMatrix = mMatrices.reduce((prev, curr) => {
      return matrixMult(prev, curr);
    }, I);

    const bMatrices = binary
      .reduce(
        (prev, _) => {
          const [last] = prev.slice(-1);
          return [...prev, matrixMult(last, last)];
        },
        [AB]
      )
      .filter((_, index) => binary[index] === "1");

    const bMatrix = bMatrices.reduce((prev, curr) => {
      return matrixMult(prev, curr);
    }, I);

    const [[M_]] = matrixMult(mMatrix, [[1n], [0n]]);

    const [[B_]] = matrixMult(bMatrix, [[0n], [1n]]);

    const largeNormalizer = normal(large);
    const M_large = largeNormalizer(M_);
    const B_large = largeNormalizer(B_);

    console.log(`After ${total} shuffles: ${M_large}*x+ ${B_large}`);

    const largeModInverter = fastInverse(large);

    // solving m*x_large % L = r
    // first m*x_inv_mod % L = 1
    // then x_large = x_inv_mod * r
    const req = 2020n;
    const x_inv = largeModInverter(M_large);
    const r = largeNormalizer(req - B_large);
    const x_large = largeNormalizer(x_inv * r);

    console.log(`Card at position ${req}, was originally: ${x_large}`);

    const y_large = largeNormalizer(
      largeNormalizer(M_large * x_large + B_large)
    );

    console.log(`Verification: ${y_large} should equal ${req}`);
    console.groupEnd();
  }
);
