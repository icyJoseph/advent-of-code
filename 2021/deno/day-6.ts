const input = await Deno.readTextFile("./input/day-6.in");

const school = input.split(",").map(Number);

const simulate = (target: number) => {
  let byDay = Array.from({ length: 9 }, () => 0);

  school.forEach((fish) => {
    byDay[fish] += 1;
  });

  let day = 0;

  while (day < target) {
    let babies = byDay[0];

    for (let i = 0; i < byDay.length; i++) {
      if (i > 0) {
        byDay[i - 1] = byDay[i - 1] + byDay[i];
      }
      byDay[i] = 0;
    }

    byDay[8] = byDay[8] + babies;
    byDay[6] = byDay[6] + babies;

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
