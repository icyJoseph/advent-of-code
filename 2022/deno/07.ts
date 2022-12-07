const input = await Deno.readTextFile("./input/07.in");

const lines = input.split("\n");

const enumerate = <T>(arr: T[]): Array<[number, T]> => {
  return arr.map((n, index) => [index, n]);
};

const collect = <T>(
  slice: T[],
  shouldContinue: (value: T, index: number) => boolean
): T[] => {
  let index = 0;

  const result = [];

  while (index < slice.length && shouldContinue(slice[index], index)) {
    result.push(slice[index]);

    index += 1;
  }

  return result;
};

const mergeChildren = (
  left: Dir["children"],
  right: Dir["children"]
): Dir["children"] => {
  // carefully merge children

  return Object.values(
    [...left, ...right].reduce((prev, curr) => {
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
    }, {} as Record<string, Node>)
  );
};

/**
 * Part One
 */

type File = { type: "file"; size: number; name: string };

type Dir = {
  type: "dir";
  children: Node[];
  name: string;
  parent: Dir;
  size: number;
  dirs: Dir[];
};

type Node = File | Dir;

const createDir = (name: string, parent?: Dir): Dir => {
  const node: Dir = {
    name,
    type: "dir",
    children: [],
    get parent() {
      if (parent) return parent;
      return this;
    },

    get size() {
      return this.children.reduce((acc, node) => {
        if (node.type === "file") return acc + node.size;

        return (
          acc + node.children.map((sub) => sub.size).reduce((a, b) => a + b)
        );
      }, 0);
    },

    get dirs() {
      return [
        this,
        ...this.children
          .filter((node): node is Dir => node.type === "dir")
          .flatMap((node) => node.dirs),
      ];
    },
  };

  return node;
};

const fs = createDir("/");

const cwd = { dir: fs };

const commands = enumerate(lines).filter(([_, line]) => line.startsWith("$"));

for (const [index, line] of commands) {
  const [, cmd, arg] = line.split(" ");

  if (cmd === "cd") {
    if (arg === "/") {
      // move to root
      cwd.dir = fs;
    } else if (arg === "..") {
      // move up to parent
      cwd.dir = cwd.dir.parent;
    } else {
      // move to arg
      // which should be a child of cwd.node
      const target = cwd.dir.children.find(
        (d) => d.type === "dir" && d.name === arg
      );

      if (!target) throw Error("No target");
      if (target.type === "file") throw Error("Cannot cd into a file");

      cwd.dir = target;
    }
  }

  if (cmd === "ls") {
    const lsChildren: Array<Node> = collect(
      lines.slice(index + 1),
      (value) => !value.startsWith("$")
    ).map((row) => {
      if (row.startsWith("dir")) {
        const [, name] = row.split(" ");

        const next = createDir(name, cwd.dir);
        return next;
      }
      const [size, name] = row.split(" ");

      return { type: "file", size: Number(size), name };
    });

    cwd.dir.children = mergeChildren(lsChildren, cwd.dir.children);
  }
}

const LIMIT = 100_000;

console.log(
  "Part one:",
  fs.dirs
    .filter((curr) => curr.size <= LIMIT)
    .reduce((acc, curr) => acc + curr.size, 0)
);

/**
 * Part Two
 */

const TOTAL_SPACE = 70_000_000;
const UNUSED_SPACE_NEEDED = 30_000_000;

const smallestDeletion = fs.dirs
  .slice(0)
  .sort((a, b) => a.size - b.size)
  .find((n) => n.size >= UNUSED_SPACE_NEEDED - TOTAL_SPACE + fs.size)?.size;

console.log("Part two:", smallestDeletion);
