const input = await Deno.readTextFile("./input/day-19.in");
// const input = await Deno.readTextFile("./input/example.in");

const reverseLookUp = (vector: number[], it: number) => {
  const [v0, v1, v2] = vector;
  switch (it) {
    case 0:
      // [x, y, z],
      return [v0, v1, v2];
    case 1:
      // [y, z, x],
      return [v2, v0, v1];
    case 2:
      // [z, x, y],
      return [v1, v2, v0];
    case 3:
      // [-x, -y, -z],
      return [-v0, -v1, -v2];
    case 4:
      // [-y, -z, -x],
      return [-v2, -v0, -v1];
    case 5:
      // [-z, -x, -y],
      return [-v1, -v2, -v0];
    case 6:
      // [x, z, y],
      return [v0, v2, v1];
    case 7:
      // [z, y, x],
      return [v2, v1, v0];
    case 8:
      // [y, x, z],
      return [v1, v0, v2];
    case 9:
      // [-x, -z, -y],
      return [-v0, -v2, -v1];
    case 10:
      // [-z, -y, -x],
      return [-v2, -v1, -v0];
    case 11:
      // [-y, -x, -z],
      return [-v1, -v0, -v2];
    case 12:
      // [-x, z, y],
      return [-v0, v2, v1];
    case 13:
      // [z, y, -x],
      return [-v2, v1, v0];
    case 14:
      // [y, -x, z],
      return [-v1, v0, v2];
    case 15:
      // [x, -y, z],
      return [v0, -v1, v2];
    case 16:
      // [-y, z, x],
      return [v2, -v0, v1];
    case 17:
      // [z, x, -y],
      return [v1, -v2, v0];
    case 18:
      // [x, -y, -z],
      return [v0, -v1, -v2];
    case 19:
      // [-y, -z, x],
      return [v2, -v0, -v1];
    case 20:
      // [-z, x, -y],
      return [v1, -v2, -v0];
    case 21:
      // [-x, -z, y],
      return [-v0, v2, -v1];
    case 22:
      // [-z, y, -x],
      return [-v2, v1, -v0];
    case 23:
      // [y, -x, -z],
      return [-v1, v0, -v2];

    default:
      throw new Error("Impossible rotation");
  }
};

const rotations = (vector: number[]): number[][] => {
  const [x, y, z] = vector;

  return [
    [x, y, z],
    [y, z, x],
    [z, x, y],

    [-x, -y, -z],
    [-y, -z, -x],
    [-z, -x, -y],

    [x, z, y],
    [z, y, x],
    [y, x, z],

    [-x, -z, -y],
    [-z, -y, -x],
    [-y, -x, -z],

    [-x, z, y],
    [z, y, -x],
    [y, -x, z],

    [x, -y, z],
    [-y, z, x],
    [z, x, -y],

    [x, -y, -z],
    [-y, -z, x],
    [-z, x, -y],

    [-x, -z, y],
    [-z, y, -x],
    [y, -x, -z]
  ];
};

const createRotations = (data: number[][]): number[][][] => {
  const all = data.map((vector) => rotations(vector));
  const scanner = [];

  for (let i = 0; i < 24; i++) {
    scanner[i] = all.map((rotation) => rotation[i]);
  }

  return scanner;
};

const add = (source: number[], ext: number[]): number[] => {
  return [source[0] + ext[0], source[1] + ext[1], source[2] + ext[2]];
};

const createScanner = (data: string) => {
  const [title, ...coords] = data.split("\n");

  const xyz = coords.map((xyz) => xyz.split(",").map(Number));

  let rotations = createRotations(xyz);

  let it = 0;

  return {
    title,
    getPrevCursor() {
      return it - 1;
    },

    getCursor() {
      return it;
    },

    coords() {
      return rotations[it];
    },

    next() {
      let ret = rotations[it];
      it = it + 1;
      return ret;
    },

    reset() {
      it = 0;
    },

    append(newCoords: number[][]) {
      xyz.push(...newCoords);

      rotations = createRotations(xyz);
    }
  };
};

const scanners = input.split("\n\n").map(createScanner);

const done: Map<ReturnType<typeof createScanner>, boolean> = new Map();

scanners.forEach((sc) => done.set(sc, false));

done.set(scanners[0], true);

const origins: number[][] = [[0, 0, 0]];

while ([...done.values()].some((v) => !v)) {
  console.log(scanners[0].title, "Rotation Index:", scanners[0].getCursor());

  const rotation = scanners[0].next();

  if (!rotation) {
    scanners[0].reset();
    break;
  }

  const hash = new Set(rotation.map((p) => p.join(",")));

  const others = scanners.filter((sc) => sc !== scanners[0]);

  outer: for (const other of others) {
    console.log("\t", other.title);

    if (done.get(other)) {
      console.log("\t Skip");
      continue;
    }
    // assuming first to be in correct position
    // rotate other until 12 positions are found
    // and move to the next position
    let otherRotation = other.next();

    while (otherRotation) {
      for (const point of rotation) {
        for (const rPoint of otherRotation) {
          const origin = [
            point[0] - rPoint[0],
            point[1] - rPoint[1],
            point[2] - rPoint[2]
          ];

          // as seen by scanner zero in this rotation
          const updated = otherRotation.map(([a, b, c]) => [
            a + origin[0],
            b + origin[1],
            c + origin[2]
          ]);

          const overlap = updated.filter((p) => hash.has(p.join(",")));

          if (overlap.length >= 12) {
            console.log("\t", scanners[0].title, "->", other.title);

            done.set(other, true);

            const index = scanners[0].getPrevCursor();

            origins.push(reverseLookUp(origin, index));

            scanners[0].append(updated.map((u) => reverseLookUp(u, index)));
            others.forEach((other) => other.reset());
            scanners[0].reset();

            break outer;
          }
        }
      }

      otherRotation = other.next();
    }
  }
  others.forEach((other) => other.reset());
}

const set: Set<string> = new Set();

for (const coord of scanners[0].coords()) {
  set.add(coord.join(","));
}

let max = 0;

const manhattan = (left: number[], right: number[]): number => {
  return [
    Math.abs(left[0] - right[0]),
    Math.abs(left[1] - right[1]),
    Math.abs(left[2] - right[2])
  ].reduce((a, b) => a + b, 0);
};

console.log("Scanner Origins");

console.log(origins);

origins.forEach((b, _, src) => {
  src.forEach((o) => {
    let m = manhattan(b, o);
    if (m > max) {
      max = m;
    }
  });
});

/**
 * Part One
 */
console.log("Part One:", set.size);

/**
 * Part Two
 */
console.log("Part Two:", max);
