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

// notice from here how each pass is just a linear transformation
const _indexReducer = length => (index, action) => {
  switch (action.type) {
    case NEW_STACK:
      const middle = length % 2n === 0n ? (length - 1n) / 2n : length / 2n;
      if (index !== middle) {
        return middle + (middle - index);
      }
      return index;
    case INCREMENT:
      const increment = action.payload;
      return (index * increment) % length;
    case CUT:
      const cut = action.payload;
      if (cut < 0n) {
        if (index < cut) {
          return index - cut;
        }
        return index - length - cut;
      } else {
        if (index < cut) {
          return index + length - cut;
        }
        return index - cut;
      }
  }
};

// an even better approach
const __indexReducer = length => (index, action) => {
  switch (action.type) {
    case NEW_STACK:
      return length - 1n - index;
    case INCREMENT:
      const increment = action.payload;
      return (index * increment) % length;
    case CUT:
      const cut = action.payload;
      if (cut < 0n) {
        if (index < cut) {
          return index - cut;
        }
        return index - length - cut;
      } else {
        if (index < cut) {
          return index + length - cut;
        }
        return index - cut;
      }
  }
};

// a very curated indexReducer, after applying %length to the cut outputs
const indexReducer = length => (index, action) => {
  switch (action.type) {
    case NEW_STACK:
      return length - 1n - index;
    case INCREMENT:
      const increment = action.payload;
      return (index * increment) % length;
    case CUT:
      const cut = action.payload;
      return index - cut;
  }
};

const linearEqReducer = length => ([m, b], action) => {
  switch (action.type) {
    case NEW_STACK:
      return [-m % length, (length - 1n - b) % length];
    case INCREMENT:
      const increment = action.payload;
      return [(m * increment) % length, (b * increment) % length];
    case CUT:
      const cut = action.payload;
      return [m % length, (b - cut) % length];
  }
};

const mod = length => val => {
  if (val < 0n) {
    return length - mod(length)(-val);
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
  // for length very large, this takes very long
  return mod(length)(c / m);
};

const binaryExp = length => (
  number,
  seed,
  prod = (x, y) => (x * y) % length,
  identity = 1n
) => {
  const binary = number
    .toString(2)
    .split("")
    .reverse();

  return binary
    .reduce(
      prev => {
        const [last] = prev.slice(-1);
        return [...prev, prod(last, last)];
      },
      [seed]
    )
    .filter((_, i) => binary[i] === "1")
    .reduce((prev, curr) => prod(prev, curr), identity);
};

const fastModInv = length => m => {
  // https://www.cs.cmu.edu/~adamchik/21-127/lectures/congruences_print.pdf
  // Fermat's little theorem
  // m ^ p -1 = 1;
  // which means that in
  // m * x % L = 1;
  // we can replace
  // m * x = m ^ p - 1
  // and return
  // x = m ^ p - 2
  // so we have to calculate m ^ length - 2n
  // PROOF:
  // length must be PRIME and m < length, L = length
  // all values of n % L for L prime and 0 < n < L are:
  // 1,2,3,4,...,L-1 % L on all, set 1
  // m * (1,2,3,...,L-1) % L on all
  // m,2m,3m,...,m(L-1) % L on all, set 2
  // 1. set 1 and 2 contain all different numbers
  // 2. none of their elements is a multiple of L
  // Conclusion: set 1 and set 2 are the same, but rearranged
  // because a * b = b * a
  // m * 2m * 3m *....* m (L-1) % L on all = 1 * 2 * 3 *...* L - 1 % L on all
  // m ^ (L-1) * (L-1)! % L = (L-1)! % L
  // since (L-1)! is not a factor of L prime, then
  // m ^ (L-1) % L= 1 % L
  // Finally, m * x % L = m ^ (L-1) % L => x = m ^ (L-2)
  // Another way is to say m * m ^ -1 * m ^ (L-1) % L = 1 => m * m ^(L-2) % L = 1 = m * x % L
  // so x = m ^ (L-2)
  return binaryExp(length)(length - 2n, m);
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_twentytwo.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    // part 1
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

    const reducer = linearEqReducer(small);

    const [m, b] = actions.reduce((prev, action) => reducer(prev, action), [
      1n,
      0n
    ]);

    // console.log(
    //   actions.reduce((prev, curr) => _indexReducer(10007n)(prev, curr), 2019n)
    // );

    const smallNormalizer = mod(small);
    const smallInverter = inverse(small);

    const x = 2019n;

    const y = smallNormalizer(x * m + b);

    const x_1 = smallInverter(m, b, y);

    // m transforms as k * m;
    // b transforms as p * b + q;
    // calculate p_q
    const [, p_q] = actions.reduce((prev, action) => reducer(prev, action), [
      0n,
      1n
    ]);

    const q = b;
    const p = (p_q - q) % small;

    const A = [
      [m, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
      [0n, 0n, p, q],
      [0n, 0n, 0n, 1n]
    ];

    const initial = [[1n], [0n], [0n], [1n]];
    const [[m_0], _, [b_0]] = dotProduct(small)(A, initial);

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

    // passing through the reducer 4 times is the same as A^4 times the initial vector
    const A2 = dotProduct(small)(A, A);
    const A4 = dotProduct(small)(A2, A2);
    const [[m_4_], , [b_4_]] = dotProduct(small)(A4, initial);

    console.assert(m_4 === smallNormalizer(m_4_));
    console.assert(b_4 === smallNormalizer(b_4_));
    console.groupEnd();

    // part 2

    console.group("Part 2");
    const large = 119_315_717_514_047n;
    const total = 101_741_582_076_661n;

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

    const Q = B;
    const P = (P_Q - Q) % large;

    // M and B vary with this matrix
    const A_Large = [
      [M, 0n, 0n, 0n],
      [0n, 0n, 0n, 0n],
      [0n, 0n, P, Q],
      [0n, 0n, 0n, 1n]
    ];

    // modular matrix multiplication
    const matrixMult = dotProduct(large);
    // we need an identity value for a product
    const I = [
      [1n, 0n, 0n, 0n],
      [0n, 1n, 0n, 0n],
      [0n, 0n, 1n, 0n],
      [0n, 0n, 0n, 1n]
    ];

    // calculates M, M^2, M^4,...for all digits and keeps those
    // with digit equal to 1 in the binary input
    // returns M * M ^2 * M ^ 4 (matrices is already filtered)
    const matrix = binaryExp(large)(total, A_Large, matrixMult, I);

    const [[M_], , [B_]] = matrixMult(matrix, initial);

    const largeNormalizer = mod(large);

    const M_large = largeNormalizer(M_);
    const B_large = largeNormalizer(B_);

    console.log(
      `After ${total} shuffles, linear transform: ${M_large} * x + ${B_large}`
    );

    const modInverter = fastModInv(large);

    // solving M * x_large % L = r
    // first M * x_inv_mod % L = 1
    // then x_large = x_inv_mod * r
    // because m * x % L = r => (m ^ p - 2) * r
    // where x_inv_mod = m ^ p - 2
    const req = 2020n;
    const x_inv_mod = modInverter(M_large);
    const r = req - B_large;
    const x_large = largeNormalizer(x_inv_mod * r);

    console.log(`Card at position ${req}, was originally: ${x_large}`);

    const y_large = largeNormalizer(
      largeNormalizer(M_large * x_large + B_large)
    );

    console.log(`Verification: ${y_large} should equal ${req}`);
    console.groupEnd();
  }
);
