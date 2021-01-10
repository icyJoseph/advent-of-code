const input = await Deno.readTextFile("./input/nineteen.in").then((res) =>
  res.split("\n\n")
);

/**
 * Helpers
 */

const [rules, messages] = input.map((chunk) => chunk.split("\n"));

const dict = new Map(
  rules.map((rule) => {
    const [name, pipe] = rule.split(": ");
    return [Number(name), pipe.replaceAll('"', "")];
  })
);

const A = "a";
const B = "b";

const combinator = (next, y) =>
  next.split(" ").reduce((prev, value) => {
    return `${prev}${value === "|" ? "|" : y(Number(value))}`;
  }, "");

const inline = (key, then = inline) => {
  const next = dict.get(key);

  if (!next) return;

  if (next === A || next === B) return `(${next})`;

  return `(${combinator(next, then)})`;
};

const curryRight = (f) => (...b) => (a) => f(a, ...b);

// found tolerance playing around, but after 5,
// the number of valid messages stops changing
const recursiveInline = (pivot, counter = {}, tolerance = 5) => {
  // once you reach the tolerance, escape through the non recursive arm
  if (pivot === 8 && counter[pivot] === tolerance)
    return `(${recursiveInline(42)})`;

  if (pivot === 11 && counter[pivot] === tolerance)
    return `${recursiveInline(42)} ${recursiveInline(31)}`;

  counter[pivot] = (counter?.[pivot] ?? 0) + 1;

  return inline(pivot, curryRight(recursiveInline)(counter, tolerance));
};

/**
 * Part One
 */

const regex = new RegExp(`^${inline(0)}$`);
const valid = messages.filter((msg) => regex.test(`${msg}`));

console.log("Part One:", valid.length);

/**
 * Part two
 */

dict.set(8, "42 | 42 8");
dict.set(11, "42 31 | 42 11 31");

const advRegex = new RegExp(`^${recursiveInline(0)}$`);
const advValid = messages.filter((msg) => msg.match(advRegex)).length;

console.log("Part Two:", advValid);

// Some other things I tried, not exhaustive

// const segment = (arr) => {
//   return arr.map((entry) => {
//     if (Array.isArray(entry)) {
//       return segment(entry);
//     }

//     if (entry === A || entry === B) {
//       return `(${entry})`;
//     }

//     const expanded = dict.get(entry);

//     return expanded;
//   });
// };

// const inlineSimple = (pipe) => {
//   return `${pipe
//     .split(" ")
//     .map((x) => {
//       const value = dict.get(Number(x));
//       if (value === A || value === B) {
//         return value;
//       }
//       if (value.includes("|")) {
//         return inlinePipe(value);
//       }
//       return inlineSimple(value);
//     })
//     .join("")}`;
// };

// const inlinePipe = (pipe) => {
//   const [left, right] = pipe.split(" | ");
//   return `( ${inlineSimple(left)}  |  ${inlineSimple(right)} )`;
// };

// const inline = (key) => {
//     if (key === A || key === B) return `(${key})`;

//     if (key === "|" || key === "(" || key === ")") return key;

//     return dict
//       .get(Number(key))
//       .split(" ")
//       .reduce((prev, curr) => {
//         if (
//           curr === "|" ||
//           curr === "(" ||
//           curr === ")" ||
//           curr === A ||
//           curr === B
//         ) {
//           return `${prev} ${curr}`;
//         }
//         const value = dict.get(Number(curr));

//         if (value === A || value === B) {
//           return `${prev} ${value}`;
//         }

//         return `(${prev} ( ${
//           value.includes("|") ? inlinePipe(value) : inlineSimple(value)
//         } ) )`;
//       }, "");
//   };console.log("Part Two:", matches);
