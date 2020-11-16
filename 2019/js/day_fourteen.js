const fs = require("fs");
const path = require("path");

const ORE = "ORE";
const FUEL = "FUEL";

const ONE_TRILLION = 1000000000000;

fs.readFile(
  path.resolve(__dirname, "../", "input/day_fourteen.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const reactions = data.split("\n");

    const equations = reactions.reduce((prev, reaction) => {
      const equation = reaction.split("=>");
      return [...prev, equation];
    }, []);

    let ore = 0;
    let start = 1180000;

    while (ore !== ONE_TRILLION) {
      let needed = { [FUEL]: start };
      let leftovers = {};

      inner: while (1) {
        const keys = Object.keys(needed);
        if (keys.length === 1 && keys[0] === ORE) {
          ore = needed[ORE];
          break inner;
        } else {
          keys.forEach(key => {
            if (key === ORE) return;

            const equation = equations.find(equation => {
              const [, right] = equation;
              return right.includes(key);
            });

            const [left, right] = equation;

            let { [key]: value } = needed;

            const [required, chemical] = right.trim().split(" ");

            const excess = required * Math.ceil(value / required) - value;

            // do we make more than we need?
            if (excess > 0) {
              leftovers[chemical] = excess;
            }

            left.split(",").forEach(input => {
              const [qty, name] = input.trim().split(" ");
              const amount = qty * Math.ceil(value / required);

              const newNeto = (needed[name] || 0) + amount;
              const leftOver = leftovers[name] || 0;
              if (leftOver === 0) {
                // nothing left over
                needed[name] = newNeto;
              } else if (leftOver > amount) {
                // don't need more
                leftovers[name] = leftOver - amount;
              } else {
                // use up whatever is leftover
                needed[name] = newNeto - leftOver;
                leftovers[name] = 0;
              }
            });

            let { [key]: omit, ...rest } = needed;

            needed = rest;
          });
        }
      }

      console.log(start, ore);
      if (ore > ONE_TRILLION) {
        start = start - 1;
      } else if (ore < ONE_TRILLION) {
        start = start + 1;
      }
    }
    console.log({ ore, start, missing: ONE_TRILLION - ore });
  }
);
