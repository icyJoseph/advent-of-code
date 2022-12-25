const [__filename_ext] = new URL("", import.meta.url).pathname
  .split("/")
  .slice(-1);
const filename = __filename_ext.replace(".ts", "");

const solve = async (example = false) => {
  const input = await Deno.readTextFile(
    `./input/${example ? "example" : filename}.in`
  );

  if (example) {
    console.log("Example", filename);
  }

  const data = input.split("\n");

  const dict = { "0": 0, "1": 1, "2": 2, "-": -1, "=": -2 };

  type Digit = keyof typeof dict;

  const rev = Object.entries(dict).reduce((prev, [key, value]) => {
    prev[value] = key as Digit;
    return prev;
  }, {} as Record<string, Digit>);

  const snafu2dec = (num: string) => {
    const list = num.split("");

    return list.reduceRight((acc, curr, pos, src) => {
      const value = dict[curr as Digit] * Math.pow(5, src.length - pos - 1);
      return acc + value;
    }, 0);
  };

  console.assert(1 === snafu2dec("1"));
  console.assert(2 === snafu2dec("2"));
  console.assert(3 === snafu2dec("1="));
  console.assert(4 === snafu2dec("1-"));
  console.assert(5 === snafu2dec("10"));
  console.assert(6 === snafu2dec("11"));
  console.assert(7 === snafu2dec("12"));
  console.assert(8 === snafu2dec("2="));
  console.assert(9 === snafu2dec("2-"));
  console.assert(10 === snafu2dec("20"));
  console.assert(15 === snafu2dec("1=0"));
  console.assert(20 === snafu2dec("1-0"));
  console.assert(2022 === snafu2dec("1=11-2"));
  console.assert(12345 === snafu2dec("1-0---0"));
  console.assert(314159265 === snafu2dec("1121-1110-1=0"));

  const rem = (n: number, c = 0) => {
    const d = (n % 5) + c;
    // if its not 0, nor 1, nor 2:
    const carry = Math.sign((d - 2) * (d - 1) * d);

    return [d - 5 * carry, carry];
  };

  const dec2snafu = (dec: number) => {
    let sn = "";
    let num = dec;

    let [digit, carry] = rem(num);

    while (true) {
      sn = `${rev[digit]}${sn}`;

      num = Math.floor(num / 5);

      if (num === 0) break;

      [digit, carry] = rem(num, carry);
    }

    if (carry === 1) sn = `${rev[carry]}${sn}`;

    return sn;
  };

  console.assert("1=-0-2" === dec2snafu(1747));
  console.assert("12111" === dec2snafu(906));
  console.assert("2=0=" === dec2snafu(198));
  console.assert("21" === dec2snafu(11));
  console.assert("2=01" === dec2snafu(201));
  console.assert("111" === dec2snafu(31));
  console.assert("20012" === dec2snafu(1257));
  console.assert("112" === dec2snafu(32));
  console.assert("1=-1=" === dec2snafu(353));
  console.assert("1-12" === dec2snafu(107));
  console.assert("12" === dec2snafu(7));
  console.assert("1=" === dec2snafu(3));
  console.assert("122" === dec2snafu(37));
  /**
   * Part One
   */
  const asDec = data.map(snafu2dec).reduce((a, b) => a + b);
  console.log(dec2snafu(asDec));
};

await solve(true);
console.log("---");
await solve();
