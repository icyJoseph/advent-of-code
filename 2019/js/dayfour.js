const [lower, upper] = [254032, 789860];

const asDigits = num =>
  num
    .toString()
    .split("")
    .map(x => parseInt(x));

const range = Array.from({ length: 1 + upper - lower }, (_, i) =>
  asDigits(lower + i)
);

/**
 * It is a six-digit number.
 * The value is within the range given in your puzzle input.
 * Two adjacent digits are the same (like 22 in 122345).
 * Going from left to right, the digits never decrease;
 * they only ever increase or stay the same (like 111123 or 135679).
 */

const ruleOne = digits => digits.length === 6;

const _ruleTwo = digits =>
  digits.some((val, index, src) => val === src[index + 1]);

/**
 *
 *  The two adjacent matching digits are not part of a larger group of matching digits.
 */

const ruleTwo = digits =>
  digits.some((val, index, src) => {
    const ocurrences = src.filter(e => e === val).length;
    if (ocurrences >= 2) {
      return (
        val !== src[index - 1] &&
        val === src[index + 1] &&
        val !== src[index + 2]
      );
    }

    return false;
  });

const ruleThree = digits =>
  digits.every((val, index, src) => {
    const next = src[index + 1] === undefined ? val : src[index + 1];
    return val <= next;
  });

const rules_one = [ruleOne, _ruleTwo, ruleThree];
const rules_two = [ruleOne, ruleTwo, ruleThree];

const problem_one = range.filter(digits =>
  rules_one.every(rule => rule(digits))
);
const problem_two = problem_one.filter(digits =>
  rules_two.every(rule => rule(digits))
);

console.log(problem_one.length);
console.log(problem_two.length);
