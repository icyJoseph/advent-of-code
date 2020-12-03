const input = await Deno.readTextFile("./input/three.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const treeCounter = ({
  grid,
  rightStep,
  downStep
}: {
  grid: string[];
  rightStep: number;
  downStep: number;
}) => {
  const gridWidth = grid[0].length;

  const { trees } = grid.reduce(
    (prev, curr, index) => {
      if (index % downStep !== 0) return prev;

      const nextRight = (prev.right + rightStep) % gridWidth;

      if (curr[prev.right] === "#") {
        return { trees: prev.trees + 1, right: nextRight };
      }

      return { ...prev, right: nextRight };
    },
    { trees: 0, right: 0 }
  );

  return trees;
};

/**
 * Part One
 */

const right3 = treeCounter({ grid: input, downStep: 1, rightStep: 3 });

console.log("Part One:", right3);

/**
 * Part Two
 */

const right1 = treeCounter({ grid: input, downStep: 1, rightStep: 1 });
const right5 = treeCounter({ grid: input, downStep: 1, rightStep: 5 });
const right7 = treeCounter({ grid: input, downStep: 1, rightStep: 7 });
const down2 = treeCounter({ grid: input, downStep: 2, rightStep: 1 });

// don't forget to include right3 from part one...
console.log("Part B:", right1 * right3 * right5 * right7 * down2);
