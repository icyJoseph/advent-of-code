const input = await Deno.readTextFile("./input/day-10.in");

const syntaxScores: Record<string, number> = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137
};

const autoCompleteScores: Record<string, number> = {
  ")": 1,
  "]": 2,
  "}": 3,
  ">": 4
};

const rows = input.split("\n");

const peekable = (chars: string[]) => {
  let i = 0;
  return {
    next() {
      let value = chars[i] ?? null;
      i = i + 1;
      return value;
    },
    peek() {
      return chars[i] ?? null;
    }
  };
};

type Node = {
  left: string | null;
  right: string | null;
  children: Node[];
};

const createNode = (): Node => {
  return { left: null, right: null, children: [] };
};

const antiNodes: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  "<": ">"
};

const parse = (
  iterable: ReturnType<typeof peekable>,
  node: Node = createNode()
): Node => {
  const next = iterable.next();

  if (next === null) return node;

  switch (next) {
    case "[":
    case "{":
    case "<":
    case "(": {
      node.left = next;

      let children: Node[] = [];

      while (["(", "[", "{", "<"].includes(iterable.peek())) {
        let child = parse(iterable);
        children.push(child);
      }

      node.children = children;
      node.right = iterable.next();

      return node;
    }

    case ")":
    case "]":
    case "}":
    case ">":
      node.right = next;
      return node;

    default:
      throw new Error(`Unexpected: ${next}`);
  }
};

const verify = (node: Node) => {
  const { left, right } = node;

  if (left === null) return;
  if (right === null) return;

  if (antiNodes[left] !== right) {
    throw right; // illegal anti node
  }
};

const verifyAll = (node: Node) => {
  node.children.forEach((child) => verifyAll(child));

  verify(node);
};

const { score, incomplete } = rows.reduce<{
  score: number;
  incomplete: Node[];
}>(
  (prev, row) => {
    let it = peekable(row.split(""));

    while (it.peek() !== null) {
      // there's more!
      const parsed = parse(it);
      try {
        verifyAll(parsed);
        prev.incomplete.push(parsed);
      } catch (err) {
        if (typeof err === "string") {
          prev.score += syntaxScores[err];
        } else {
          throw new Error(err);
        }
      }
    }

    return prev;
  },
  { score: 0, incomplete: [] }
);

const complete = (node: Node, acc: string[]) => {
  if (node.left === null) {
    throw new Error("Node is opened with null");
  }

  if (node.right === null) {
    acc.push(antiNodes[node.left]);
  }
};

const completeNode = (node: Node, acc: string[] = []) => {
  node.children.forEach((child) => completeNode(child, acc));

  complete(node, acc);

  return acc;
};

const autoScoreResults = incomplete.map((entry) => {
  return completeNode(entry).reduce((prev, curr) => {
    return prev * 5 + autoCompleteScores[curr];
  }, 0);
});

autoScoreResults.sort((a, b) => b - a);

/**
 * Part One
 */
console.log("Part One:", score);

/**
 * Part Two
 */
console.log("Part Two:", autoScoreResults[(autoScoreResults.length - 1) / 2]);
