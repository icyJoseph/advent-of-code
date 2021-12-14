const input = await Deno.readTextFile("./input/day-14.in");
// const input = await Deno.readTextFile("./input/example.in");

const [template, rest] = input.split("\n\n");

const rules: Record<string, string> = rest
  .split("\n")
  .map((row) => row.split(" -> "))
  .reduce((prev, curr) => {
    const [key, value] = curr;

    return { ...prev, [key]: value };
  }, {});

let result = template.split("");

let step = 0;

while (1) {
  step += 1;

  if (step > 10) {
    break;
  }

  result = result.reduce<string[]>((prev, curr, index, src) => {
    if (index === 0) {
      prev.push(curr);
    } else {
      const key = `${src[index - 1]}${curr}`;
      const value = rules[key];

      prev.push(value, curr);
    }
    return prev;
  }, []);
}

let counts: Record<string, number> = {};

for (const entry of result) {
  counts[entry] = (counts[entry] || 0) + 1;
}

const [max] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
const [min] = Object.entries(counts).sort((a, b) => a[1] - b[1]);

/**
 * Part One
 */
console.log("Part One:", max[1] - min[1]);

const singleCounts = template
  .split("")
  .reduce((prev: Record<string, number>, char) => {
    return {
      ...prev,
      [char]: (prev[char] || 0) + 1
    };
  }, {});

let pairCounts = template
  .split("")
  .reduce((prev: Record<string, number>, curr, index, src) => {
    if (index === 0) return prev;

    const key = `${src[index - 1]}${curr}`;

    return { ...prev, [key]: (prev[key] || 0) + 1 };
  }, {});

step = 0;

while (1) {
  step += 1;

  if (step > 40) {
    break;
  }

  pairCounts = Object.entries(pairCounts).reduce(
    (prev: Record<string, number>, curr) => {
      const [pair, count] = curr;
      // produces two pairs
      const rule = rules[pair];

      const [left, right] = pair.split("");

      const leftKey = `${left}${rule}`;
      const rightKey = `${rule}${right}`;

      singleCounts[rule] = (singleCounts[rule] || 0) + count;

      if (pair === rightKey && pair === leftKey) {
        return {
          ...prev,
          [pair]: prev[pair] * 2
        };
      }

      if (pair === rightKey) {
        return {
          ...prev,
          [pair]: prev[pair],
          [leftKey]: (prev[leftKey] || 0) + count
        };
      }

      if (pair === leftKey) {
        return {
          ...prev,
          [pair]: prev[pair],
          [rightKey]: (prev[rightKey] || 0) + count
        };
      }

      return {
        ...prev,
        [pair]: prev[pair] - count,
        [leftKey]: (prev[leftKey] || 0) + count,
        [rightKey]: (prev[rightKey] || 0) + count
      };
    },
    { ...pairCounts }
  );
}

const largeMax = Object.entries(singleCounts).sort((a, b) => b[1] - a[1]);
const largeMin = Object.entries(singleCounts).sort((a, b) => a[1] - b[1]);

/**
 * Part Two
 */
console.log("Part Two:", largeMax[0][1] - largeMin[0][1]);
