const isDebug = Deno.args.includes("--debug");

/**
 * Helpers
 */

const sum = (a: number, b: number) => a + b;

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  if (isDebug) {
    console.log("Debug Mode Active");
  }

  /**
   * Part One
   */

  const lines = input.split("").map(Number);

  type Disk =
    | { size: number; type: "file"; id: number }
    | {
        size: number;
        type: "space";
        id: null;
      };

  const createState: () => { id: number; disk: Disk[] } = () => ({
    id: 0,
    disk: [],
  });

  const diskMap = lines.reduce((acc, curr, index) => {
    if (index % 2 === 0) {
      for (let i = 0; i < curr; i++) {
        acc.disk.push({ size: 1, type: "file", id: acc.id });
      }
      acc.id = acc.id + 1;

      return acc;
    }
    for (let i = 0; i < curr; i++) {
      acc.disk.push({ size: 1, type: "space", id: null });
    }
    return acc;
  }, createState()).disk;

  let cursor = diskMap.length - 1;

  diskMap.forEach((value, index) => {
    if (value.type === "file") return;

    if (cursor < index) return;

    diskMap[index] = { ...diskMap[cursor] };
    diskMap[cursor].type = "space";
    diskMap[cursor].id = null;

    while (true) {
      cursor = cursor - 1;
      if (diskMap[cursor].type === "space") continue;
      break;
    }
  });

  console.log(
    "Part 1:",
    diskMap
      .map((val, index) => (val.type === "space" ? 0 : index * val.id))
      .reduce(sum)
  );

  /**
   * Part Two
   */

  const compactDiskMap = lines.reduce((acc, curr, index) => {
    if (index % 2 === 0) {
      acc.disk.push({ size: curr, type: "file", id: acc.id });
      acc.id = acc.id + 1;

      return acc;
    }

    acc.disk.push({ size: curr, type: "space", id: null });

    return acc;
  }, createState()).disk;

  compactDiskMap.forEach((entry, index) => {
    if (entry.type === "file") return;

    const targetIndex = compactDiskMap.findLastIndex(
      (n) => n.type === "file" && n.size <= entry.size
    );

    if (targetIndex < index) return;

    const freeAfter = entry.size - compactDiskMap[targetIndex].size;

    compactDiskMap[index] = compactDiskMap[targetIndex];

    compactDiskMap[targetIndex] = {
      type: "space",
      size: entry.size - freeAfter,
      id: null,
    };

    if (freeAfter === 0) return;

    compactDiskMap.splice(index + 1, 0, {
      type: "space",
      size: freeAfter,
      id: null,
    });
  });

  console.log(
    "Part 2:",
    compactDiskMap
      .flatMap(({ type, id, size }) =>
        Array.from({ length: size }, () => (type === "space" ? 0 : id))
      )
      .map((value, index) => value * index)
      .reduce(sum)
  );
};

/**
 * Runtime
 */

async function run(filename = "", isExample = false) {
  console.log("Day", filename);

  if (isExample) {
    console.log("Example");
    await solve(`./input/example.in`);
    console.log("---");
  } else {
    await solve(`./input/${filename}.in`);
  }
}

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);
