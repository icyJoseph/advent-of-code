const log = console.log;

/**
 * Helpers
 */

const solve = (input: string, ans: Answer) => {
  /**
   * Part One
   */

  const lines = input.split("\n").map(BigInt);

  const mix = (l: bigint, r: bigint) => l ^ r;
  const prune = (l: bigint) => l % 16777216n;

  function evolve(num: bigint) {
    let secret = num;

    const step1 = secret * 64n;
    secret = mix(secret, step1);
    secret = prune(secret);

    const step2 = secret / 32n;
    secret = mix(secret, step2);
    secret = prune(secret);

    const step3 = secret * 2048n;
    secret = mix(secret, step3);
    secret = prune(secret);

    return secret;
  }

  ans.p1 = Number(
    lines.reduce((prev, curr) => {
      let i = 0;
      let result = curr;
      while (i < 2000) {
        result = evolve(result);

        i++;
      }
      return prev + result;
    }, 0n)
  );

  const [changes, allPrices] = lines.reduce(
    (prev, curr) => {
      let i = 0;

      let result = curr;

      const rates: bigint[] = [];
      const prices: bigint[] = [];

      while (i < 2000) {
        const tmp = result;
        result = evolve(tmp);
        const rate = (result % 10n) - (tmp % 10n);
        prices.push(result % 10n);
        rates.push(rate);

        i++;
      }

      prev[0].push(rates);
      prev[1].push(prices);

      return prev;
    },
    [[], []] as bigint[][][]
  );

  // "-2,1,-1,3"
  // const seq = "-1,-1,0,2".split(",").map(BigInt);
  // console.log(
  //   windows(changes[0], 4)
  //     .map((w, i) => [...w, prices[0][i + 3]])
  //     .slice(0, 10)
  //     .map((w) => console.log(w) || w)
  //     .filter((w) => w.slice(0, 4).every((n, i) => n === seq[i]))
  // );

  const freqs = new Map<bigint, bigint>();

  changes.forEach((change, pos) => {
    const prices = allPrices[pos];
    const seqs = windows(change, 4);

    const done = new Set();

    seqs.forEach((seq, i) => {
      const price = prices[i + 3];

      const key = seq.reduce((acc, curr) => acc * 100n + curr, 0n);

      if (done.has(key)) return;

      done.add(key);

      const curr = freqs.get(key) ?? 0n;

      freqs.set(key, curr + price);
    });
  });

  let max = 0;

  freqs.values().forEach((val) => {
    max = Math.max(Number(val), max);
  });

  ans.p2 = max;

  /**
   *
   * Part Two
   */
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

type Answer = { p1: any; p2: any };

const filename = import.meta.filename?.split("/").at(-1)?.replace(".ts", "");
const isExample = Deno.args.includes("--example");

await run(filename, isExample);

function windows<T>(arr: T[], size: number) {
  return (
    arr
      .reduce<T[][]>((acc, row, index, src) => {
        acc.push(src.slice(index, index + size));

        return acc;
      }, [])
      // no irregular windows at the end
      .filter((w) => w.length === size)
  );
}
