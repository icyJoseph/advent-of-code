const input = await Deno.readTextFile("./input/six.in").then((res) =>
  res.split("\n")
);

/**
 * Part One
 */

const allAnswers = input.reduce<string[][]>(
  (prev, curr) => {
    if (curr === "") return [...prev, []];
    const [last] = prev.slice(-1);
    return [
      ...prev.slice(0, prev.length - 1),
      [...new Set([...last, ...curr.split("")])]
    ];
  },
  [[]]
);

console.log("Part One:", allAnswers.flat(Infinity).length);

/**
 * Part Two
 */

const allAnswersByGroup = input
  .reduce<string[][]>(
    (prev, curr) => {
      if (curr === "") return [...prev, []];

      const [last] = prev.slice(-1);

      return [...prev.slice(0, prev.length - 1), [...last, curr]];
    },
    [[]]
  )
  .map((group) => {
    const answers = group
      .flatMap((x) => x.split(""))
      .reduce<Record<string, number>>((prev, curr) => {
        if (prev[curr]) return { ...prev, [curr]: prev[curr] + 1 };
        return { ...prev, [curr]: 1 };
      }, {});

    return Object.values(answers).filter((ans) => ans === group.length);
  })
  .reduce((prev, curr) => curr.length + prev, 0);

console.log("Part Two:", allAnswersByGroup);
