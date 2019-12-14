const fs = require("fs");
const path = require("path");

const ORE = "ORE";
const FUEL = "FUEL";

const balanceEq = (left, right, amount) => {
  const [_coef] = right.trim().split(" ");
  const coef = Math.ceil(amount / parseInt(_coef));

  const parts = left
    .split(",")
    .map(sub => sub.trim().split(" "))
    .map(([q, name]) => `${parseInt(q) * coef} ${name}`);

  return parts;
};

fs.readFile(
  path.resolve(__dirname, "../", "input/example.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const reactions = data.split("\n");

    const equations = reactions.reduce((prev, reaction) => {
      const equation = reaction.split("=>");

      if (equation[1].includes(FUEL)) {
        return prev;
      }

      return [...prev, equation];
    }, []);

    const [fuelEq] = reactions.filter(equation => equation.includes(FUEL));

    const [components] = fuelEq.split("=>");

    const basics = equations.filter(equation => {
      const [left] = equation;
      return left.includes(ORE);
    });

    const basicKeys = basics.reduce((prev, curr) => {
      const [, right] = curr;
      const [, name] = right.trim().split(" ");

      return {
        ...prev,
        [name]: true
      };
    }, {});

    console.log({ basicKeys });

    const calculators = basics.reduce((prev, curr) => {
      const [left, right] = curr;
      const [_ore] = left.split(" ");
      const [_coef, name] = right.trim().split(" ");

      return {
        ...prev,
        [name]: amount => {
          return parseInt(_ore) * Math.ceil(amount / parseInt(_coef));
        }
      };
    }, {});

    let toBasics = components.split(",");

    let done = false;

    while (!done) {
      toBasics = toBasics
        .map(component => component.trim().split(" "))
        .map(([amount, name]) => {
          const equation = equations.find(expr => {
            const [left, right] = expr;
            return right.includes(name) && !left.includes(ORE);
          });

          if (equation) {
            return balanceEq(...equation, parseInt(amount));
          }
          return `${amount} ${name}`;
        })
        .flat();

      done = toBasics.every(equation => {
        const [, key] = equation.split(" ");
        return basicKeys[key];
      });
    }

    const summary = toBasics.reduce((prev, curr) => {
      const [amount, name] = curr.split(" ");
      return {
        ...prev,
        [name]: prev[name] ? prev[name] + parseInt(amount) : parseInt(amount)
      };
    }, {});

    console.log({ basics, summary });

    const total = Object.keys(summary).reduce((prev, curr) => {
      const fn = calculators[curr](summary[curr]);
      return fn + prev;
    }, 0);

    console.log(total);
  }
);
