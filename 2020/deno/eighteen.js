const input = await Deno.readTextFile("./input/eighteen.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const sum = (a, b) => a + b;

const printer = (parsed) =>
  parsed.reduce((prev, curr) => {
    if (Array.isArray(curr)) {
      return `${prev}(${printer(curr)})`;
    }

    return `${prev}${curr}`;
  }, "");

const iterable = (_chars) => {
  let i = 0;
  const chars = _chars.slice(0);

  return {
    next() {
      let value = chars[i];
      i = i + 1;
      if (!value) return null;
      return value;
    },
    peek() {
      return chars[i] ?? null;
    }
  };
};

const linearParser = (chars, _acc = []) => {
  if (!chars.peek()) return _acc;

  let acc = _acc;

  const current = chars.next();

  switch (current) {
    case "(": {
      let section = linearParser(chars, []);
      acc.push(section);
      return linearParser(chars, acc);
    }
    case ")":
      return acc;
    case "*": {
      acc.push("*");
      return linearParser(chars, acc);
    }
    case "+": {
      acc.push("+");
      return linearParser(chars, acc);
    }
    default: {
      acc.push(Number(current));
      return linearParser(chars, acc);
    }
  }
};

const linearEvaluate = (parsed) =>
  parsed.reduce(
    (prev, curr) => {
      if (Array.isArray(curr)) {
        const group = linearEvaluate(curr);
        if (prev.op === "+") {
          return { acc: prev.acc + group.acc, op: null };
        } else if (prev.op === "*") {
          return { acc: prev.acc * group.acc, op: null };
        } else {
          return { acc: group.acc, op: null };
        }
      }

      switch (curr) {
        case "+":
        case "*":
          return { ...prev, op: curr };
        default: {
          if (prev.op === "+") {
            return { acc: prev.acc + curr, op: null };
          } else if (prev.op === "*") {
            return { acc: prev.acc * curr, op: null };
          } else {
            return { acc: curr, op: null };
          }
        }
      }
    },
    { acc: null, op: null }
  );

const regularParser = (expression, operator) => {
  const { segment, acc } = expression.split("").reduce(
    (prev, curr) => {
      let depth = prev.depth;
      let acc = prev.acc;
      let segment = prev.segment;

      if (curr === "(") {
        depth = depth + 1;
      } else if (curr === ")") {
        depth = depth - 1;
      }

      if (depth === 0 && operator === curr) {
        return { acc: [...acc, segment], segment: "", depth };
      } else {
        return { depth, acc, segment: `${segment}${curr}` };
      }
    },
    { depth: 0, acc: [], segment: "" }
  );

  return [...acc, segment];
};

const parseMult = (expression) =>
  regularParser(expression, "*")
    .map((expr) => {
      const [head] = expr;
      if (head === "(") {
        return parseSums(expr.substr(1, expr.length - 2));
      }
      return Number(expr);
    })
    .reduce((acc, no) => acc * no, 1);

const parseSums = (expression) =>
  regularParser(expression, "+")
    .map((expr) => parseMult(expr))
    .reduce(sum, 0);

const evaluate = (expression) =>
  regularParser(expression, "+")
    .map((expr) => parseMult(expr))
    .reduce(sum, 0);

const transform = (expr) =>
  `(${expr.replaceAll(" ", "").replaceAll("*", ")*(")})`;

/**
 * Part One
 */

const grouped = input.map((row) => {
  return row.replaceAll(" ", "");
});

console.log(
  "Part One:",
  grouped
    .map(iterable)
    .reduce((prev, row) => prev + linearEvaluate(linearParser(row)).acc, 0),
  4297397455886
);

/**
 * Part Two
 */

console.log(
  "Part Two:",
  grouped.map(transform).map(evaluate).reduce(sum, 0),
  93000656194428
);

// Extra bit
console.log(
  "Part Two and half:",
  grouped
    .map(transform)
    // Good old eval works...
    .map((x) => eval(x))
    .reduce(sum, 0)
);

//94950394914409 too high
//94783822389731 too high
//91029960079781
//46425852542752 too low
