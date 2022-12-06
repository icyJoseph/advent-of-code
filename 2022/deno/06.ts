const input = await Deno.readTextFile("./input/06.in");

const data = input.trim();

const windows = <T>(arr: T[], size: number) =>
  arr
    .reduce<T[][]>((acc, _, index, src) => {
      acc.push(src.slice(index, index + size));

      return acc;
    }, [])
    // no irregular windows at the end
    .filter((w) => w.length === size);

/**
 * Part One
 */

const signal = data.split("");

const countCharacters = (signal: string[], size: number) =>
  size +
  windows(signal, size).findIndex((c) => [...new Set(c)].length === size);

console.log("Part one:", countCharacters(signal, 4));

/**
 * Part Two
 */

console.log("Part two:", countCharacters(signal, 14));
