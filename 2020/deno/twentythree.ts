const input = await Deno.readTextFile("./input/twentythree.in");

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

  let current = numbers.shift()!;
  let a = numbers.shift()!;
  let b = numbers.shift()!;
  let c = numbers.shift()!;

  let sub = 1;
  let destinationIndex = -1;

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

const withSettersGetters = () => {
  const node = (_next: number, _prev: number) => {
    let next = _next;
    let prev = _prev;

    return {
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

  const nodes = Array.from({ length: million }, (_, i) => {
    const next = i === million - 1 ? 0 : i + 1;
    const prev = i === 0 ? million - 1 : i - 1;

    return node(next, prev);
  });

  numbers.forEach((number, i) => {
    nodes[number].next = numbers[i === million - 1 ? 0 : i + 1] ?? i + 1;
    nodes[number].prev = numbers[i === 0 ? million - 1 : i - 1] ?? million - 1;
  });

  nodes[numbers.length].prev = numbers[numbers.length - 1];
  nodes[million - 1].next = numbers[0];

  let current = million - 1;

  let iterator = 0;

  console.time(withSettersGetters.name);

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

  console.timeEnd(withSettersGetters.name);

  const first = nodes[0].next;
  const second = nodes[first].next;

  console.log("Part Two:", (first + 1) * (second + 1));
};

const withMethodDef = () => {
  const node = (_next: number, _prev: number) => {
    let next = _next;
    let prev = _prev;

    return {
      next() {
        return next;
      },
      updateNext(val: number) {
        next = val;
      },
      prev() {
        return prev;
      },
      updatePrev(val: number) {
        prev = val;
      }
    };
  };

  const nodes = Array.from({ length: million }, (_, i) => {
    const next = i === million - 1 ? 0 : i + 1;
    const prev = i === 0 ? million - 1 : i - 1;

    return node(next, prev);
  });

  numbers.forEach((number, i) => {
    nodes[number].updateNext(numbers[i === million - 1 ? 0 : i + 1] ?? i + 1);
    nodes[number].updatePrev(
      numbers[i === 0 ? million - 1 : i - 1] ?? million - 1
    );
  });

  nodes[numbers.length].updatePrev(numbers[numbers.length - 1]);
  nodes[million - 1].updateNext(numbers[0]);

  let current = million - 1;

  let iterator = 0;

  console.time(withMethodDef.name);

  while (iterator < 10_000_000) {
    iterator = iterator + 1;

    current = nodes[current].next();
    let first = nodes[current].next();
    let second = nodes[first].next();
    let third = nodes[second].next();

    nodes[current].updateNext(nodes[third].next());

    nodes[nodes[third].next()].updatePrev(current);

    let destination = current - 1 < 0 ? million - 1 : current - 1;
    while ([first, second, third].indexOf(destination) !== -1) {
      destination = destination === 0 ? million - 1 : destination - 1;
    }

    nodes[third].updateNext(nodes[destination].next());

    nodes[nodes[destination].next()].updatePrev(third);

    nodes[destination].updateNext(first);
    nodes[first].updatePrev(destination);
  }
  console.timeEnd(withMethodDef.name);

  const first = nodes[0].next();
  const second = nodes[first].next();

  console.log("Part Two:", (first + 1) * (second + 1));
};

const withProperties = () => {
  const node = (next: number, prev: number) => {
    return {
      next,
      prev
    };
  };

  const nodes = Array.from({ length: million }, (_, i) => {
    const next = i === million - 1 ? 0 : i + 1;
    const prev = i === 0 ? million - 1 : i - 1;

    return node(next, prev);
  });

  numbers.forEach((number, i) => {
    nodes[number].next = numbers[i === million - 1 ? 0 : i + 1] ?? i + 1;
    nodes[number].prev = numbers[i === 0 ? million - 1 : i - 1] ?? million - 1;
  });

  nodes[numbers.length].prev = numbers[numbers.length - 1];
  nodes[million - 1].next = numbers[0];

  let current = million - 1;

  let iterator = 0;

  console.time(withProperties.name);

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

  console.timeEnd(withProperties.name);

  const first = nodes[0].next;
  const second = nodes[first].next;

  console.log("Part Two:", (first + 1) * (second + 1));
};

const withArrays = () => {
  const next = Array.from({ length: million }, (_, i) =>
    i === million - 1 ? 0 : i + 1
  );

  const prev = Array.from({ length: million }, (_, i) =>
    i === 0 ? million - 1 : i - 1
  );

  numbers.forEach((number, i) => {
    next[number] = numbers[i === million - 1 ? 0 : i + 1] ?? i + 1;
    prev[number] = numbers[i === 0 ? million - 1 : i - 1] ?? million - 1;
  });

  prev[numbers.length] = numbers[numbers.length - 1];
  next[million - 1] = numbers[0];

  let current = million - 1;

  let iterator = 0;

  console.time(withArrays.name);

  while (iterator < 10_000_000) {
    iterator = iterator + 1;

    current = next[current];

    const [first, second = next[first], third = next[second]] = [
      next[current]
    ] as number[];

    next[current] = next[third];
    prev[next[third]] = current;

    let destination = current - 1 < 0 ? million - 1 : current - 1;
    while ([first, second, third].indexOf(destination) !== -1) {
      destination = destination === 0 ? million - 1 : destination - 1;
    }

    next[third] = next[destination];
    prev[next[destination]] = third;

    next[destination] = first;
    prev[first] = destination;
  }

  console.timeEnd(withArrays.name);

  const first = next[0];
  const second = next[first];

  console.log("Part Two:", (first + 1) * (second + 1));
};

/**
 *
 * After a few tests:
 *
 * withSettersGetters: 34013ms
 * withMethodDef: 8507ms
 * withProperties: 2294ms
 * withArrays: 499ms
 * 
 */

// withSettersGetters();
// withMethodDef();
// withProperties();
withArrays();
