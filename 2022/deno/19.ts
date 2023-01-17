const [__filename] = new URL("", import.meta.url).pathname.split("/").slice(-1);
const filename = __filename.replace(".ts", "");

const solve = async (pathname: string) => {
  const input = await Deno.readTextFile(pathname);

  const blueprints = input.split("\n").map((row, id) => {
    const [ore, clay, obsOreCost, obsClayCost, geodeOreCost, geodeObsCost] = row
      .split(" ")
      .map(Number)
      .filter(isFinite);

    return {
      id: id + 1,
      oreCost: { ore },
      clayCost: { ore: clay },
      obsCost: { ore: obsOreCost, clay: obsClayCost },
      geodeCost: { ore: geodeOreCost, obs: geodeObsCost },
    };
  });

  const initial = {
    rocks: { ore: 0, clay: 0, obs: 0, geo: 0 },
    bots: { ore: 1, clay: 0, obs: 0, geo: 0 },
  };

  function search(costs: typeof blueprints[0], limit: number) {
    const nodes = new Set<string>();
    const seen = new Set();

    nodes.add(JSON.stringify(initial));

    let minute = 0;
    let max = 0;

    const maxOreEverNeededAtOnce = Math.max(
      costs.oreCost.ore,
      costs.obsCost.ore,
      costs.clayCost.ore,
      costs.geodeCost.ore
    );

    const maxClayEverNeededAtOnce = costs.obsCost.clay;
    const maxObsEverNeededAtOnce = costs.geodeCost.obs;

    while (true) {
      const nextNodes = new Set<string>();

      // shift here is bad
      for (const key of nodes) {
        if (seen.has(key)) continue;

        seen.add(key);

        const node = JSON.parse(key) as typeof initial;

        /**
          > Each robot can collect 1 of its resource type per minute. 
          > It also takes one minute for the robot factory (also conveniently from your pack) 
          > to construct any type of robot, although it consumes the necessary 
          > resources available when construction begins.

          In this case, every minute, the robot factory uses up a number of rocks,
          but at every tick, it only builds one robot, so once we have enough robots
          so that at every tick we collect as many rocks as the factory could possibly use up
          on the next iteration, then we can stop keeping track of exactly
          how many of that robot exist.

          Key example: `orebots>=max.claybots=a.obsbots=b.geobots=c`

          In this case, we say, these family of keys are unique by abc, because ore has hit a max.

          > Note that geo is never set to saturate (we want as many as possible), 

          Similarly, any leftovers made during ramp-up can be ignored, that is, 
          only once we have enough robots so that every tick we collect as many rocks 
          as the factory ~might~ use up, we can clamp the inventory of those rocks
          to the max ever needed at once.

          Key example for rocks: `orerocks=a.clayrocks>=max.obsrocks=b.georocs=c`

          In this case, we ought to have as many robots as `max` for the clay rock, only then
          can we saturate the key.

          We'd still need to fork at every possibility, but we can reduce the number of 
          nodes to search whenever either rocks or robots, for other than geodes, reach a max. 

        */

        const ore =
          node.bots.ore === maxOreEverNeededAtOnce
            ? maxObsEverNeededAtOnce
            : node.rocks.ore + node.bots.ore;

        const clay =
          node.bots.clay === maxClayEverNeededAtOnce
            ? maxClayEverNeededAtOnce
            : node.rocks.clay + node.bots.clay;

        const obs =
          node.bots.obs === maxObsEverNeededAtOnce
            ? maxObsEverNeededAtOnce
            : node.rocks.obs + node.bots.obs;

        const geo = node.rocks.geo + node.bots.geo;

        max = Math.max(geo, max);

        // the next step is just collecting resources
        nextNodes.add(
          JSON.stringify({
            rocks: { ore, clay, obs, geo },
            bots: { ...node.bots },
          })
        );

        // the next step either builds ore, clay, obs or geode
        if (
          node.rocks.ore >= costs.oreCost.ore &&
          node.bots.ore < maxOreEverNeededAtOnce
        ) {
          // limit the amount of ore bots
          nextNodes.add(
            JSON.stringify({
              rocks: { ore: ore - costs.oreCost.ore, clay, obs, geo },
              bots: {
                ...node.bots,
                ore: Math.min(node.bots.ore + 1, maxOreEverNeededAtOnce),
              },
            })
          );
        }

        if (
          node.rocks.ore >= costs.clayCost.ore &&
          node.bots.clay < maxClayEverNeededAtOnce
        ) {
          // limit the clay

          nextNodes.add(
            JSON.stringify({
              rocks: { ore: ore - costs.clayCost.ore, clay, obs, geo },
              bots: {
                ...node.bots,
                clay: Math.min(node.bots.clay + 1, maxClayEverNeededAtOnce),
              },
            })
          );
        }

        if (
          node.rocks.ore >= costs.obsCost.ore &&
          node.rocks.clay >= costs.obsCost.clay &&
          node.bots.obs < maxObsEverNeededAtOnce
        ) {
          // limit the obs bots
          nextNodes.add(
            JSON.stringify({
              rocks: {
                ore: ore - costs.obsCost.ore,
                clay: clay - costs.obsCost.clay,
                obs,
                geo,
              },
              bots: {
                ...node.bots,
                obs: Math.min(node.bots.obs + 1, maxObsEverNeededAtOnce),
              },
            })
          );
        }

        if (
          node.rocks.ore >= costs.geodeCost.ore &&
          node.rocks.obs >= costs.geodeCost.obs
        ) {
          // under no circumstance skip, nor limit these
          nextNodes.add(
            JSON.stringify({
              rocks: {
                ore: ore - costs.geodeCost.ore,
                clay,
                obs: obs - costs.geodeCost.obs,
                geo,
              },
              bots: {
                ...node.bots,
                geo: node.bots.geo + 1,
              },
            })
          );
        }
      }

      minute += 1;

      if (minute === limit) break;

      nodes.clear();

      nextNodes.forEach((str) => {
        const node = JSON.parse(str) as typeof initial;

        // keep if not seen, and if it could potentially go over the max seen so far
        if (!seen.has(str) && node.rocks.geo + node.bots.geo >= max) {
          nodes.add(str);
        }
      });
    }

    return max;
  }

  /**
   * Part One
   */
  console.log(
    "Part one:",
    blueprints.map((bp) => bp.id * search(bp, 24)).reduce((a, b) => a + b)
  ); // 1934 too low

  /**
   * Part Two
   */
  console.log(
    "Part two:",
    blueprints
      .slice(0, 3)
      .map((bp) => search(bp, 32))
      .reduce((a, b) => a * b)
  ); // 62160 too low
  // 88160 -> right
};

if (Deno.args.includes("--example")) {
  console.log("Example");
  await solve(`./input/${filename}.example.in`); // 33 and 3472
  console.log("---");
}

await solve(`./input/${filename}.in`); // 1962 and 88160
