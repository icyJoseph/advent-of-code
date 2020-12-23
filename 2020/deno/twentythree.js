const input = await Deno.readTextFile("./input/twentythree.in");

/**
 * Helpers
 */

/**
 * Part One
 */

let numbers = input.split("").map(Number);

const totalMoves = 100;

const highest = Math.max(...numbers);

const lowest = Math.min(...numbers);

let start = 0;

while (start < totalMoves) {
  start = start + 1;

  let current = numbers.shift();
  let a = numbers.shift();
  let b = numbers.shift();
  let c = numbers.shift();

  let sub = 1;
  let destinationIndex;

  while (1) {
    let destination = current - sub;

    if (destination < lowest) {
      // weak point
      destination = highest - (Math.abs(destination) % (highest - lowest + 2)); // not really
    }

    if (destination === a || destination === b || destination === c) {
      sub = sub + 1;
      continue;
    }

    destinationIndex = numbers.indexOf(destination);
    break;
  }

  numbers.splice(destinationIndex + 1, 0, a, b, c);

  numbers.push(current);
}

const oneIndex = numbers.indexOf(1);

const reordered = [
  ...numbers.slice(oneIndex + 1),
  ...numbers.slice(0, oneIndex)
].join("");

console.log("Part One:", reordered);

/**
 * Part Two
 */

const million = 1_000_000;

// subtract one to match label value to zero index based math
numbers = input.split("").map((x) => Number(x) - 1);

// next[num] ->
// <- prev[value]

const node = (_next, _prev, _value) => {
  let next = _next;
  let prev = _prev;
  let value = _value;
  return {
    debug() {
      console.log({ next, prev, value: value + 1 });
    },
    get value() {
      return value + 1;
    },
    get next() {
      return next;
    },
    set next(val) {
      next = val;
    },
    get prev() {
      return prev;
    },
    set prev(val) {
      prev = val;
    }
  };
};

// each position refers back to the label 0 through 999_999
// ADD ONE TO get back the real value
const nodes = Array.from({ length: million }, (_, i) => {
  const next = i === million - 1 ? 0 : i + 1;
  const prev = i === 0 ? million - 1 : i - 1;

  return node(next, prev, i);
});

numbers.forEach((number, i) => {
  nodes[number].next = numbers[i === million - 1 ? 0 : i + 1] ?? i + 1;
  nodes[number].prev = numbers[i === 0 ? million - 1 : i - 1] ?? million - 1;
});

nodes[numbers.length].prev = numbers[numbers.length - 1];
nodes[million - 1].next = numbers[0];

let current = million - 1;

let iterator = 0;

while (iterator < 10_000_000) {
  iterator = iterator + 1;

  current = nodes[current].next;
  let first = nodes[current].next;
  let second = nodes[first].next;
  let third = nodes[second].next;

  nodes[current].next = nodes[third].next;

  nodes[nodes[third].next].prev = current;

  let destination = current - 1 < 0 ? million - 1 : current - 1;
  while ([first, second, third].indexOf(destination) !== -1) {
    destination = destination === 0 ? million - 1 : destination - 1;
  }

  nodes[third].next = nodes[destination].next;

  nodes[nodes[destination].next].prev = third;

  nodes[destination].next = first;
  nodes[first].prev = destination;
}

const first = nodes[0].next;
const second = nodes[first].next;

console.log("Part Two:", (first + 1) * (second + 1));
