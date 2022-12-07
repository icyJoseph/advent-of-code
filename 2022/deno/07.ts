const input = await Deno.readTextFile("./input/07.in");

const data = input.split("\n");

/**
 * Part One
 */

type File = { type: "file"; size: number; name: string };
type Dir = {
  type: "dir";
  children: Node[];
  name: string;
  parent: Dir | null;
  size?: number;
};

type Node = File | Dir;
const cwd: { dir: Dir | null } = { dir: null };

const fs: Dir = { type: "dir", children: [], name: "/", parent: null };

const enumerate = <T>(arr: T[]): Array<[number, T]> => {
  return arr.map((n, index) => [index, n]);
};

for (const [index, line] of enumerate(data)) {
  //   log(line);
  if (line.startsWith("$")) {
    const [, cmd, arg] = line.split(" ");

    if (cmd === "cd") {
      if (arg === "/") {
        // move to root
        cwd.dir = fs;
      } else if (arg === "..") {
        // move up to parent
        if (cwd.dir?.parent === null) {
          console.warn("Unknown parent!", cwd.dir);
        }
        cwd.dir = cwd.dir?.parent!; // what to do if we have no knowledge?
      } else {
        // move to arg
        // which should be a child of cwd.node
        let target = cwd.dir?.children.find(
          (d) => d.type === "dir" && d.name === arg
        );

        if (!target) {
          // target not found!
          target = { type: "dir", name: arg, children: [], parent: cwd.dir };
          cwd.dir?.children.push(target);
          cwd.dir = target;
        } else {
          cwd.dir = target as Dir;
        }
      }
    } else if (cmd === "ls") {
      // collect the next lines until a
      // new $ is found
      let end = data.slice(index + 1).findIndex((n) => n.startsWith("$"));

      if (end === -1) {
        end = data.length;
      }
      const list = data.slice(index + 1, index + end + 1);

      if (cwd.dir?.children) {
        const currentChildren = cwd.dir.children;

        const lsChildren: Array<Node> = list.map((row) => {
          if (row.startsWith("dir")) {
            const [, name] = row.split(" ");
            return { type: "dir", name, children: [], parent: cwd.dir };
          }
          const [size, name] = row.split(" ");
          return { type: "file", size: Number(size), name };
        });

        // carefully merge children

        const asObj = [...lsChildren, ...currentChildren].reduce(
          (prev, curr) => {
            const seen = prev[curr.name];

            if (!seen) {
              return { ...prev, [curr.name]: curr };
            }

            if (curr.type === "dir" && seen.type === "dir") {
              seen.children = [...curr.children, ...seen.children];

              return { ...prev, [curr.name]: seen };
            }

            // if it is an already seen file, continue

            return prev;
          },
          {} as Record<string, Node>
        );

        cwd.dir.children = Object.values(asObj);
      }
    }
  } else {
    // ls output
    continue;
  }
}

const tracked: Dir[] = [];
const all: Dir[] = [];
const LIMIT = 100_000;

const calcDirSize = (dir: Dir): number => {
  if (dir.children.length === 0) return 0;

  const dirSize = dir.children.reduce((acc, curr) => {
    if (curr.type === "file") {
      return acc + curr.size;
    }

    return acc + calcDirSize(curr);
  }, 0);

  dir.size = dirSize;

  if (dirSize <= LIMIT) {
    tracked.push(dir);
  }

  all.push(dir);
  return dirSize;
};

calcDirSize(fs);

console.log(
  "Part one:",
  tracked.reduce((acc, curr) => acc + curr.size!, 0)
);

/**
 * Part Two
 */

const TOTAL_SPACE = 70_000_000;
const UNUSED_SPACE_NEEDED = 30_000_000;

const current_unused = TOTAL_SPACE - fs.size!;

const required = UNUSED_SPACE_NEEDED - current_unused;

const smallestDeletion = all
  .slice(0)
  .sort((a, b) => a.size! - b.size!)
  .map(({ name, size }) => ({ name, size }))
  .find((n) => n.size! >= required)?.size;

console.log("Part two:", smallestDeletion);
