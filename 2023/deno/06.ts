const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

/**
 * Helpers
 */

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  const [time, distance] = input.split("\n");
  const times = time
    .split(" ")
    .filter(Boolean)
    .map(Number)
    .filter(isFinite);

  const distances = distance
    .split(" ")
    .filter(Boolean)
    .map(Number)
    .filter(isFinite);

  const races = times.map((time, i) => ({
    time,
    distance: distances[i],
  }));

  console.log(
    "Part 1:",
    races.reduce((acc, race) => {
      let wins = 0;

      for (let hold = 0; hold <= race.time; hold++) {
        const travels = (race.time - hold) * hold;

        if (travels > race.distance) wins += 1;
      }

      return acc * wins;
    }, 1)
  );

  /**
   * Part Two
   */

  const [_time, _distance] = input.split("\n");

  const longTime = Number(
    _time.replace("Time:", "").replaceAll(" ", "")
  );

  const longDistance = Number(
    _distance.replace("Distance:", "").replaceAll(" ", "")
  );

  console.log(
    "Part 2:",
    Math.floor(
      Math.sqrt(longTime * longTime - 4 * longDistance)
    )
  );
};

console.log("Day", filename);
if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
