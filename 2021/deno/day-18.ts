const input = await Deno.readTextFile("./input/day-18.in");
// const input = await Deno.readTextFile("./input/example.in");

type Fish =
  | {
      left: Fish;
      right: Fish;
    }
  | {
      value: number;
    };

const parsed = input.split("\n").map((row) => JSON.parse(row));

const createTree = (node: any): Fish => {
  if (Array.isArray(node)) {
    return {
      left: createTree(node[0]),
      right: createTree(node[1])
    };
  }

  if (typeof node === "number") {
    return { value: node };
  }

  throw new Error("Node must be either an array or a number");
};

const findParent = (fish: Fish, tree: Fish): Fish | null => {
  if ("value" in tree) {
    return null;
  }

  if (tree.left === fish) {
    return tree;
  }

  if (tree.right === fish) {
    return tree;
  }

  return findParent(fish, tree.left) || findParent(fish, tree.right);
};

const firstByDepth = (
  node: Fish,
  predicate: (depth: number) => boolean,
  depth = 0
): Fish | null => {
  if ("value" in node) return null;

  if (predicate(depth)) return node;

  return (
    firstByDepth(node.left, predicate, depth + 1) ||
    firstByDepth(node.right, predicate, depth + 1)
  );
};

const firstByValue = (
  node: Fish,
  predicate: (value: number) => boolean
): Fish | null => {
  if ("value" in node) {
    if (predicate(node.value)) return node;
    return null;
  }

  return (
    firstByValue(node.left, predicate) || firstByValue(node.right, predicate)
  );
};

const findRightMostValue = (root: Fish): Fish => {
  if ("value" in root) return root;

  return findRightMostValue(root.right);
};

const findLeftMostValue = (root: Fish): Fish => {
  if ("value" in root) return root;

  return findLeftMostValue(root.left);
};

const findClosestNumber = (
  fish: Fish,
  tree: Fish,
  dir: "left" | "right"
): Fish | null => {
  const parent = findParent(fish, tree);

  if (!parent) return null;

  if ("value" in parent) throw new Error("Invalid parent");

  if (dir === "left") {
    if (parent.right === fish) {
      if ("value" in parent.left) {
        return parent.left;
      }

      return findRightMostValue(parent.left);
    }

    return findClosestNumber(parent, tree, dir);
  }
  if (parent.left === fish) {
    if ("value" in parent.right) {
      return parent.right;
    }

    return findLeftMostValue(parent.right);
  }

  return findClosestNumber(parent, tree, dir);
};

const toList = (fish: Fish): any => {
  if ("value" in fish) {
    return fish.value;
  }

  return [toList(fish.left), toList(fish.right)];
};

function reduce(tree: Fish) {
  while (1) {
    const deepFish = firstByDepth(tree, (depth) => depth === 4);

    if (deepFish) {
      const parent = findParent(deepFish, tree);

      if (!parent) throw new Error("No parent");

      if ("value" in parent) throw new Error("Invalid parent");
      if ("value" in deepFish) throw new Error("Invalid exploding pair");
      if ("left" in deepFish.left) throw new Error("Invalid exploding pair");
      if ("right" in deepFish.right) throw new Error("Invalid exploding pair");

      const leftValue = deepFish.left.value;
      const rightValue = deepFish.right.value;

      const leftNode = findClosestNumber(deepFish, tree, "left");
      const rightNode = findClosestNumber(deepFish, tree, "right");

      if (leftNode) {
        if ("value" in leftNode) {
          leftNode.value = leftNode.value + leftValue;
        }
      }

      if (rightNode) {
        if ("value" in rightNode) {
          rightNode.value = rightNode.value + rightValue;
        }
      }

      if (parent.left === deepFish) {
        parent.left = { value: 0 };
      } else {
        parent.right = { value: 0 };
      }

      continue;
    }

    const largeFish = firstByValue(tree, (val) => val >= 10);

    if (largeFish) {
      if ("left" in largeFish) throw new Error("Fish must be of value type");
      if ("right" in largeFish) throw new Error("Fish must be of value type");

      const [left, right] = [
        Math.floor(largeFish.value / 2),
        Math.ceil(largeFish.value / 2)
      ];

      const parent = findParent(largeFish, tree);

      if (!parent) throw new Error("No parent!");
      if ("value" in parent) throw new Error("Invalid parent");

      if (parent.left === largeFish) {
        parent.left = { left: { value: left }, right: { value: right } };
      } else {
        parent.right = { left: { value: left }, right: { value: right } };
      }

      continue;
    }

    break;
  }

  return tree; // reduced
}

function magnitude(fish: Fish): number {
  if ("value" in fish) {
    return fish.value;
  }

  return 3 * magnitude(fish.left) + 2 * magnitude(fish.right);
}

const school = parsed.map((p) => createTree(p));

const sum = school.reduce((prev, right) => {
  return reduce({ left: prev, right });
});

/**
 * Part One
 */

console.log("Part One:", magnitude(sum));

/**
 * Part Two
 */

const sums = input.split("\n").reduce((prev: number[], left, _, src) => {
  return [
    ...prev,
    ...src.map((right) => {
      if (right === left) return 0;

      return magnitude(
        reduce({
          left: createTree(JSON.parse(left)),
          right: createTree(JSON.parse(right))
        })
      );
    })
  ];
}, []);

console.log("Part Two:", Math.max(...sums));

/**
 * Assertions
 */

console.assert(
  magnitude(
    createTree([
      [
        [
          [5, 0],
          [7, 4]
        ],
        [5, 5]
      ],
      [6, 6]
    ])
  ) === 1137,
  "Magnitude is not working as expected"
);

console.assert(
  magnitude(
    createTree([
      [
        [
          [8, 7],
          [7, 7]
        ],
        [
          [8, 6],
          [7, 7]
        ]
      ],
      [
        [
          [0, 7],
          [6, 6]
        ],
        [8, 7]
      ]
    ])
  ) === 3488,
  "Magnitude is not working as expected"
);
