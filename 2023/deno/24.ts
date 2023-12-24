import z3Lib from "npm:z3-solver";

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
  const [p, w, q] = data.slice(0, 3);

  /**
   * we want rx,ry,rz, and drx,dry,drz
   *
   * px + dpx * tp = rx + drx * tp
   * py + dpy * tp = ry + dry * tp
   * pz + dpz * tp = rz + drz * tp
   *
   * wx + dwx * tw = rx + drx * tw
   * wy + dwy * tw = ry + dry * tw
   * wz + dwz * tw = rz + drz * tw
   *
   * qx + dqx * tq = rx + drx * tq
   * qy + dqy * tq = ry + dry * tq
   * qz + dqz * tq = rz + drz * tq
   *
   * unknowns-> tq,tp,tw, rx,ry,rz, drx,dry,drz
   *
   * 9 eqs, 9 unknowns
   *
   * tp = (px - rx)/(drx - dpx)
   * tw = (wx - rx)/(drx - dwx)
   * qw = (qx - rx)/(drx - dqx)
   *
   * py * (drx - dpx) + dpy * (px - rx) = ry * (drx - dpx) + dry
   * pz * (drx - dpx) + dpz * (px - rx) = rz * (drx - dpx) + drz
   *
   * wy * (drx - dwx) + dwy * (wx - rx) = ry * (drx - dwx) + dry
   * wz * (drx - dwx) + dwz * (wx - rx) = rz * (drx - dwx) + drz
   *
   * qy * (drx - dqx) + dqy * (qx - rx) = ry * (drx - dqx) + dry
   * qz * (drx - dqx) + dqz * (qx - rx) = rz * (drx - dqx) + drz
   *
   * 6 eqs, 6 vars rx,ry,rz,drx,dry,drz
   *
   * dry = py * (drx - dpx) + dpy * (px - rx) - ry * (drx - dpx)
   *     = wy * (drx - dwx) + dwy * (wx - rx) - ry * (drx - dwx)
   *     = qy * (drx - dqx) + dqy * (qx - rx) - ry * (drx - dqx)
   *
   * py * (drx - dpx) + dpy * (px - rx)
   * - wy * (drx - dwx) - dwy * (wx - rx)
   * = ry * (drx - dpx) - ry * (drx - dwx)
   *  = ry (drx - dpx - drx + dwx)
   *  = ry (dwx - dpx)
   *
   * py*drx - py*dpx + dpy*px - dpy*rx
   * - wy*drx + wy*dwx - dwy*wx + dwy*rx = ry(dwx - dpx)
   *
   * drx*(py - wy) - py*dpx + dpy*px + rx*(dwy - dpy) + wy*dwx - wx*dwy
   * = ry (dwx - dpx) ...(1)
   *
   * py * (drx - dpx) + dpy * (px - rx) - qy * (drx - dqx) - dqy * (qx - rx)
   *  = ry * (drx - dpx) - ry * (drx - dqx)
   *
   * py*drx - py*dpx + dpy*px - dpy*rx - qy*drx + qy*dqx - dqy*qx + dqy*rx
   * = ry*(dqx - dpx)
   *
   * drx(py-qy) - py*dpx + dpy*px + rx*(dqy - dpy) + qy*dqx - qx*dqy
   * = ry*(dqx - dpx) ...(2)
   *
   * wy * (drx - dwx) + dwy * (wx - rx) - qy * (drx - dqx) - dqy * (qx - rx)
   * = ry * (drx - dwx) - ry * (drx - dqx)
   *
   * drx(wy-qy) - wy*dwx + dwy*wx - rx * dwy + qy*dqx - dqy*qz + dqy *rx
   * = ry (dqx - dwx)
   *
   * drx*(wy-qy) - wy*dwx + wx*dwy + rx*(dqy - dwy) + qy*dqx - qz*dqy
   * = ry (dqx - dwx) ..(3)
   */

  const { Context } = await z3Lib.init();
  const z3 = Context("p2");

  const x = z3.Real.const("x");
  const y = z3.Real.const("y");
  const z = z3.Real.const("z");

  const dx = z3.Real.const("dx");
  const dy = z3.Real.const("dy");
  const dz = z3.Real.const("dz");

  const solver = new z3.Solver();

  let i = 0;
  for (const vec of [p, w, q]) {
    const { pos, vel } = vec;
    const time = z3.Real.const(`t-${i}`);

    solver.add(time.ge(0));
    solver.add(
      time.mul(dx).add(x).eq(time.mul(vel[0]).add(pos[0]))
    );

    solver.add(
      time.mul(dy).add(y).eq(time.mul(vel[1]).add(pos[1]))
    );

    solver.add(
      time.mul(dz).add(z).eq(time.mul(vel[2]).add(pos[2]))
    );

    i++;
  }
  // Deno Panics here...
  // Deno has panicked. This is a bug in Deno. Please report this (NO)
  await solver.check();
  // Used Node.js for this last bit

  const model = solver.model();
  const arr = [
    // @ts-expect-error value not present in types
    model.eval(x).value().numerator,
    // @ts-expect-error value not present in types
    model.eval(y).value().numerator,
    // @ts-expect-error value not present in types
    model.eval(z).value().numerator,
  ];

  // 27671002969301356719n too high
  // 886858737029295n
  console.log(arr.reduce((a, b) => a + b, 0n));
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
