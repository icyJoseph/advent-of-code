const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");
const debug = Deno.args.includes("--debug");

/**
 * Helpers
 */

function gcd(a: bigint, b: bigint) {
  if (!b) {
    if (b === 0n) return a;
    throw new Error("Invalid b input");
  }
  return gcd(b, a % b);
}

class Fraction {
  num: bigint;
  den: bigint;

  constructor(num: bigint, den = 1n) {
    this.num = num;
    this.den = den;
  }

  static add(lhs: Fraction, rhs: Fraction): Fraction {
    const [newNum, newDen] = [
      lhs.num * rhs.den + rhs.num * lhs.den,
      lhs.den * rhs.den,
    ];

    const factor = gcd(newNum, newDen);
    return new Fraction(newNum / factor, newDen / factor);
  }

  static sub(lhs: Fraction, rhs: Fraction): Fraction {
    return Fraction.add(
      lhs,
      new Fraction(-1n * rhs.num, rhs.den)
    );
  }

  static prod(lhs: Fraction, rhs: Fraction): Fraction {
    const [newNum, newDen] = [
      lhs.num * rhs.num,
      lhs.den * rhs.den,
    ];
    const factor = gcd(newNum, newDen);
    return new Fraction(newNum / factor, newDen / factor);
  }

  static inv(lhs: Fraction): Fraction {
    if (lhs.num === 0n) {
      return new Fraction(0n);
    }
    return new Fraction(lhs.den, lhs.num);
  }

  static div(lhs: Fraction, rhs: Fraction): Fraction {
    return Fraction.prod(lhs, Fraction.inv(rhs));
  }

  static isZero(lhs: Fraction): boolean {
    return lhs.num === 0n;
  }

  static abs(lhs: Fraction): Fraction {
    return new Fraction(
      lhs.num < 0n ? -lhs.num : lhs.num,
      lhs.den < 0n ? -lhs.den : lhs.den
    );
  }

  static lessThan(lhs: Fraction, rhs: Fraction): boolean {
    return lhs.num * rhs.den < rhs.num * lhs.den;
  }

  evaluate(): bigint {
    return this.num / this.den;
  }

  print() {
    return `${this.num}/${this.den}`;
  }
}

function eliminationByGauss(mat: Fraction[][]) {
  let y = 0;
  let x = 0;

  const width = mat[0].length;
  const height = mat.length;

  while (y < height && x < width) {
    const kCol = mat.map((row) => row[x]);

    let max: Fraction | null = null;

    kCol.forEach((v) => {
      if (
        max === null ||
        Fraction.lessThan(max, Fraction.abs(v))
      ) {
        max = v;
      }
    });

    if (max === null) {
      throw new Error("No max");
    }
    const yMax = kCol.indexOf(max);

    if (Fraction.isZero(mat[yMax][x])) {
      // no pivot
      x++;
    } else {
      // row swap
      [mat[y], mat[yMax]] = [mat[yMax], mat[y]];

      for (let dy = y + 1; dy < height; dy++) {
        const f = Fraction.div(mat[dy][x], mat[y][x]);

        mat[dy][x] = new Fraction(0n);

        for (let dx = x + 1; dx < width; dx++) {
          mat[dy][dx] = Fraction.sub(
            mat[dy][dx],
            Fraction.prod(f, mat[y][dx])
          );
        }
      }

      y++;
      x++;
    }
  }

  return mat;
}

function findSolutions(mat: Fraction[][]) {
  return mat.reduce<Fraction[]>((acc, curr, index, src) => {
    if (acc.length === 0) {
      const [a, b] = curr.slice(-2);
      return [Fraction.div(b, a)];
    }

    const [q, ...rest] = curr.slice(
      src.length - 1 - index,
      curr.length - 1
    );

    const qs = rest
      .map((r, i) =>
        Fraction.prod(Fraction.div(r, q), acc[i])
      )
      .reduce(
        (a, b) => Fraction.add(a, b),
        new Fraction(0n)
      );

    return [
      Fraction.sub(
        Fraction.div(curr[curr.length - 1], q),
        qs
      ),
      ...acc,
    ];
  }, []);
}

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (debug) {
    console.log("Debug Mode Active");
  }

  const inBound = (n: number, upper: number, lower = 0) =>
    n >= lower && n <= upper;

  /**
   * Part One
   */

  const data = input.split("\n").map((row) => {
    const [pos, vel] = row
      .split(" @ ")
      .map((n) =>
        n.replaceAll(", ", ",").split(",").map(Number)
      );

    return { pos, vel };
  });

  const [from, to] = isExample
    ? [7, 27]
    : [200_000_000_000_000, 400_000_000_000_000];

  /**
   *  y = m*x + c
   * y - y1 = m(x-x1)
   * y =mx - mx1 + y1
   * y = mx + (y1 -mx1)
   *   m = vel[1]/vel[0] = a = b
   *   c = pos[1] - m*pos[0] = c = d
   */

  const inters = data
    .map((curr, index, src) => {
      const others = src.slice(index + 1);

      const a = curr.vel[1] / curr.vel[0];
      const c = curr.pos[1] - a * curr.pos[0];

      return others.map((other) => {
        const b = other.vel[1] / other.vel[0];
        const d = other.pos[1] - b * other.pos[0];

        return [
          (d - c) / (a - b), // x
          (a * (d - c)) / (a - b) + c, // y
          curr,
          other,
        ] as const;
      });
    })
    .flat(1);

  const valid = inters
    .filter(
      ([x, y]) =>
        inBound(x, to, from) && inBound(y, to, from)
    )
    .filter(([xi, yi, curr]) => {
      const dist =
        (curr.pos[0] - xi) * (curr.pos[0] - xi) +
        (curr.pos[1] - yi) * (curr.pos[1] - yi);

      const xi2 = xi + curr.vel[0];
      const yi2 = yi + curr.vel[1];
      const dist2 =
        (curr.pos[0] - xi2) * (curr.pos[0] - xi2) +
        (curr.pos[1] - yi2) * (curr.pos[1] - yi2);

      // if we have gotten away, we good
      return dist2 >= dist;
    })
    .filter(([xi, yi, , other]) => {
      const dist =
        (other.pos[0] - xi) * (other.pos[0] - xi) +
        (other.pos[1] - yi) * (other.pos[1] - yi);

      const xi2 = xi + other.vel[0];
      const yi2 = yi + other.vel[1];

      const dist2 =
        (other.pos[0] - xi2) * (other.pos[0] - xi2) +
        (other.pos[1] - yi2) * (other.pos[1] - yi2);

      // if we have gotten away, we good
      return dist2 >= dist;
    });

  console.log("Part 1:", valid.length);

  /**
   * Part Two
   */
  const dist = (arr: number[]) =>
    arr.map((v) => Math.abs(v)).reduce((a, b) => a + b, 0);

  const [p, w, q] = (
    isExample
      ? data.slice(0, 3)
      : // Magic stuff ... still needs analysis
        data
          .toSorted((a, b) => dist(b.pos) - dist(a.pos))
          .slice(-20)
  ).map(({ pos, vel }) => {
    const [x, y, z] = pos.map((v) => BigInt(v));
    const [dx, dy, dz] = vel.map((v) => BigInt(v));
    return { x, y, z, dx, dy, dz };
  });

  // TODO: Link to equation derivation
  const matrix = [
    // z, y, x, dz, dy, dx = C
    [
      0n,
      -(p.dx - q.dx),
      p.dy - q.dy,
      0n,
      p.x - q.x,
      -(p.y - q.y),
      q.y * q.dx - q.x * q.dy - (p.y * p.dx - p.x * p.dy),
    ],
    [
      0n,
      -(p.dx - w.dx),
      p.dy - w.dy,
      0n,
      p.x - w.x,
      -(p.y - w.y),
      w.y * w.dx - w.x * w.dy - (p.y * p.dx - p.x * p.dy),
    ],
    [
      -(p.dy - q.dy),
      p.dz - q.dz,
      0n,
      p.y - q.y,
      -(p.z - q.z),
      0n,
      q.z * q.dy - q.y * q.dz - (p.z * p.dy - p.y * p.dz),
    ],
    [
      -(p.dy - w.dy),
      p.dz - w.dz,
      0n,
      p.y - w.y,
      -(p.z - w.z),
      0n,
      w.z * w.dy - w.y * w.dz - (p.z * p.dy - p.y * p.dz),
    ],
    [
      -(p.dx - q.dx),
      0n,
      p.dz - q.dz,
      p.x - q.x,
      0n,
      -(p.z - q.z),
      q.z * q.dx - q.x * q.dz - (p.z * p.dx - p.x * p.dz),
    ],
    [
      -(p.dx - w.dx),
      0n,
      p.dz - w.dz,
      p.x - w.x,
      0n,
      -(p.z - w.z),
      w.z * w.dx - w.x * w.dz - (p.z * p.dx - p.x * p.dz),
    ],
  ].map((row) => row.map((num) => new Fraction(num)));

  // console.log(
  //   matrix
  //     .map((row) =>
  //       row
  //         .map((x) => `${x.print()}`.padStart(20, " "))
  //         .join("")
  //     )
  //     .join("\n")
  // );

  eliminationByGauss(matrix);

  const zeroCount = (list: Fraction[]) => {
    let count = 0;
    let index = 0;
    while (true) {
      if (Fraction.isZero(list[index])) {
        count++;
        index++;
      } else {
        break;
      }
    }
    return count;
  };

  matrix.sort(
    (lhs, rhs) => zeroCount(rhs) - zeroCount(lhs)
  );

  console.log(
    "Part 2:",
    findSolutions(matrix)
      .slice(0, 3)
      .reduce(
        (a, b) => Fraction.add(a, b),
        new Fraction(0n)
      )
      .evaluate()
      .toString()
    // "\n",
    // 886858737029295n
  );
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/${filename}.example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
