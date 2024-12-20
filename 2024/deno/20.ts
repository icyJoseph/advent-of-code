const isDebug = Deno.args.includes("--debug");
const log = console.log;

/**
 * Helpers
 */

const solve = (input: string, ans: Answer) => {
  /**
   * Part One
   */

  let start = [0, 0];
  let end = [0, 0];
  const grid = input.split("\n").map((row, y) =>
    row.split("").map((cell, x) => {
      if (cell === "S") start = [x, y];
      if (cell === "E") end = [x, y];
      return cell;
    })
  );
  const width = grid[0].length;
  const height = grid.length;

  const adj = makeAdj(width, height);

  const [normalTime, path] = bfs(
    coordToIndex(start[0], start[1], width),
    coordToIndex(end[0], end[1], width),
    grid.flat(),
    adj
  );
  const delta = isExample ? 64 : 100;

  const pathCoords = path.map((p) => ({
    x: p % width,
    y: Math.floor(p / width),
  }));

  ans.p1 = pathCoords
    .map((left, from) => {
      // to is relative to from 🐛
      return pathCoords.slice(from + 1).filter((right, to) => {
        const dist = Math.abs(left.x - right.x) + Math.abs(left.y - right.y);

        const saves = to + 1 - dist;

        return dist <= 2 && delta <= saves;
      }).length;
    })
    .reduce((a, b) => a + b);

  /**
   * Part Two
   */
  ans.p2 = pathCoords
    .map((left, from) => {
      // to is relative to from 🐛
      return pathCoords.slice(from + 1).filter((right, to) => {
        const dist = Math.abs(left.x - right.x) + Math.abs(left.y - right.y);

        const saves = to + 1 - dist;

        return dist <= 20 && delta <= saves;
      }).length;
    })
    .reduce((a, b) => a + b);

  // grid.flat().forEach((cell, index, src) => {
  //   if (cell !== "#") return;

  //   for (const vec of adj[index]) {
  //     if (src[vec] === "#") return;
  //     // if (done.has([index, vec].sort().join("::"))) continue;

  //     const copy = [...src];
  //     // copy[vec] = ".";
  //     // copy[index] = ".";

  //     const time = bfs(
  //       coordToIndex(start[0], start[1], width),
  //       coordToIndex(end[0], end[1], width),
  //       copy,
  //       adj,
  //       { start: index, end: vec }
  //     );

  //     // done.add([index, vec].sort().join("::"));

  //     if (normalTime - time >= delta) {
  //       // console.log(
  //       //   "saved",
  //       //   normalTime - time,
  //       //   { x: index % width, y: Math.floor(index / width) },
  //       //   { x: vec % width, y: Math.floor(vec / width) }
  //       // );
  //       ans.p1 += 1;
  //     }
  //   }
  // });
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  log("-- Day", filename, "--");

  const path = isExample ? "./input/example.in" : `./input/${filename}.in`;
  const input = await Deno.readTextFile(path);

  const ans: Answer = { p1: 0, p2: 0 };

  if (isExample) log("Example");

  solve(input, ans);

  console.log("Part 1:", ans.p1);
  console.log("Part 2:", ans.p2);

  log("-- Done --");
}

type Answer = { p1: number; p2: number };

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);

function makeAdj(width: number, height: number) {
  const adj: number[][] = Array.from({ length: height * width }, () => []);

  // dx,dy
  const deltas = [
    [-1, 0], //left
    [1, 0], //right
    [0, -1], //up
    [0, 1], //down
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = coordToIndex(x, y, width);

      deltas.forEach(([dx, dy]) => {
        const x1 = x + dx;
        const y1 = y + dy;

        if (0 <= x1 && x1 < width && 0 <= y1 && y1 < height) {
          adj[index].push(coordToIndex(x1, y1, width));
        }
      });
    }
  }

  return adj;
}

function coordToIndex(x: number, y: number, width: number) {
  return x + y * width;
}

function bfs(
  start: number,
  end: number,
  grid: string[],
  adj: number[][],
  cheat?: { start: number; end: number }
) {
  const q: number[] = [];
  const distance = Array.from({ length: grid.length }, () => Infinity);
  const visited = new Set();

  visited.add(start);
  distance[start] = 0;
  q.push(start);

  const path: number[] = [];

  while (true) {
    const current = q.shift();

    if (current == null) break;
    path.push(current);

    if (current === end) {
      return [distance[end], path] as const;
    }
    for (const vec of adj[current]) {
      // if (cheat) {
      //   if (grid[current] === "#" && cheat.end !== vec) continue;
      // }

      if (grid[vec] === "#") {
        // if (cheat) {
        //   if (cheat.start === vec) {
        //     if (visited.has(vec)) continue;

        //     visited.add(vec);
        //     distance[vec] = distance[current] + 1;
        //     q.push(vec);
        //   }
        // }
        continue;
      }
      if (visited.has(vec)) continue;

      visited.add(vec);
      distance[vec] = distance[current] + 1;
      q.push(vec);
    }
  }

  return [distance[end], path] as const;
}
