const input = await Deno.readTextFile("./input/eighteen.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

type Peekable = { next: () => string | null; peek: () => string | null };
type Parsed =
  | number
  | "*"
  | "+"
  | number[]
  | (number | number[] | "*" | "+" | Parsed)[];

const sum = (a: number, b: number) => a + b;

const printer = (parsed: Parsed[]): string =>
  parsed.reduce<string>((prev: string, curr: Parsed) => {
    if (Array.isArray(curr)) {
      return `${prev}(${printer(curr)})`;
    }

    return `${prev}${curr}`;
  }, "");

const iterable = (_chars: string[]): Peekable => {
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

const linearParser = (chars: Peekable, _acc: Parsed[] = []): Parsed[] => {
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

type OP = "+" | "*" | null;
const linearEvaluate = (
  parsed: Parsed[] | number[]
): { acc: number; op: OP } => {
  // @ts-expect-error
  return parsed.reduce<{ acc: number; op: OP }>(
    (prev: { acc: number; op: OP }, curr: number | Parsed) => {
      if (Array.isArray(curr)) {
        const group: { acc: number; op: OP } = linearEvaluate(curr);
        if (prev.op === "+") {
          return { acc: prev.acc + Number(group.acc), op: null };
        } else if (prev.op === "*") {
          return { acc: prev.acc * Number(group.acc), op: null };
        }

        return { acc: Number(group.acc), op: null };
      } else if (curr === "+" || curr === "*") {
        return { ...prev, op: curr };
      } else if (typeof curr === "number") {
        if (prev.op === "+") {
          return { acc: prev.acc + Number(curr), op: null };
        } else if (prev.op === "*") {
          return { acc: prev.acc * Number(curr), op: null };
        } else {
          return { acc: Number(curr), op: null };
        }
      }
      return prev;
    },
    { acc: 0, op: null }
  );
};

const regularParser = (expression: string, operator: "*" | "+") => {
  const { segment, acc } = expression
    .split("")
    .reduce<{ segment: string; acc: string[]; depth: number }>(
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

const parseMult = (expression: string): number =>
  regularParser(expression, "*")
    .map((expr) => {
      const [head] = expr;
      if (head === "(") {
        return parseSums(expr.substr(1, expr.length - 2));
      }
      return Number(expr);
    })
    .reduce((acc, no) => acc * no);

const parseSums = (expression: string): number =>
  regularParser(expression, "+")
    .map((expr) => parseMult(expr))
    .reduce(sum, 0);

const evaluate = (expression: string) =>
  regularParser(expression, "+")
    .map((expr) => parseMult(expr))
    .reduce(sum, 0);

const transform = (expr: string) =>
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
    .map((row) => iterable(row.split("")))
    .reduce((prev, row) => prev + linearEvaluate(linearParser(row)).acc, 0)
);

/**
 * Part Two
 */

console.log("Part Two:", grouped.map(transform).map(evaluate).reduce(sum, 0));

// Extra bit
console.log(
  "Part Two and half:",
  grouped
    .map(transform)
    // Good old eval works...
    .map(eval)
    .reduce(sum, 0)
);

//94950394914409 too high
//94783822389731 too high
//91029960079781
//46425852542752 too low
