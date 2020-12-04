const input = await Deno.readTextFile("./input/four.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const mandatoryFields = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"];
const optionalFields = ["cid"];

const toArrayOfPasswords = (batch: string[]) =>
  batch.reduce<string[]>((prev, curr) => {
    if (curr === "") {
      return [...prev, ""];
    }
    const [last = ""] = prev.slice(-1);

    return [...prev.slice(0, prev.length - 1), last ? `${last} ${curr}` : curr];
  }, []);

/**
 * Part One
 */

const validWithFieldPresence = toArrayOfPasswords(input).filter((passport) =>
  mandatoryFields.every((field) => passport.includes(field))
);

console.log("Part One:", validWithFieldPresence.length);

/**
 * Part Two
 */

const validWithFieldValues = toArrayOfPasswords(input).filter((passport) => {
  const hasAllMandatoryFields = mandatoryFields.every((field) =>
    passport.includes(field)
  );

  if (!hasAllMandatoryFields) return false;

  return passport
    .split(" ")
    .map((field) => {
      const [name, value] = field.split(":");
      return {
        name,
        value
      };
    })
    .every(({ name, value }) => {
      switch (name) {
        case "byr":
          return (
            value.length === 4 &&
            parseInt(value) >= 1920 &&
            parseInt(value) <= 2002
          );
        case "iyr":
          return (
            value.length === 4 &&
            parseInt(value) >= 2010 &&
            parseInt(value) <= 2020
          );
        case "eyr":
          return (
            value.length === 4 &&
            parseInt(value) >= 2020 &&
            parseInt(value) <= 2030
          );
        case "hgt": {
          // don't judge
          const [m, d, c, unit0, unit1] = value.split("");
          if (unit1 === "m" && unit0 === "c") {
            const h = parseInt(`${m}${d}${c}`);
            return h >= 150 && h <= 193;
          } else if (unit0 === "n" && c === "i") {
            const h = parseInt(`${m}${d}`);
            return h >= 59 && h <= 76;
          }
          return false;
        }
        case "hcl": {
          const [first, ...rest] = value.split("");
          if (first === "#") {
            return (
              rest.length === 6 &&
              // don't judge here either
              rest.every(
                (x) => "abcdef".includes(x) || "0123456789".includes(x)
              )
            );
          }

          return false;
        }

        case "ecl":
          return ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"].includes(
            value
          );
        case "pid":
          return (
            value.length === 9 &&
            value.split("").map((x) => Number.isInteger(x))
          );
        case "cid":
          return true;
        default:
          console.log(`Invalid field: ${name} with value ${value}`);
          return false;
      }
    });
});

console.log("Part Two:", validWithFieldValues.length);
