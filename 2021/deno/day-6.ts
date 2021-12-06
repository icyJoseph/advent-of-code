const input = await Deno.readTextFile("./input/day-6.in");

const school = input.split(",").map(Number);

const simulate = (target: number) => {
  let byDay = Array.from({ length: 9 }, () => 0);

  school.forEach((fish) => {
    byDay[fish] += 1;
  });

  let day = 0;

  while (day < target) {
    let atZero = byDay.shift();
    // keep ts happy
    if (atZero == null) throw new Error("Impossible...");

    byDay.push(atZero);
    byDay[6] = byDay[6] + atZero;

    day = day + 1;
  }

  return byDay.reduce((acc, curr) => acc + curr, 0);
};

/**
 * Part One
 */
console.log("Part One:", simulate(80));

/**
 * Part Two
 */
console.log("Part Two:", simulate(256));
