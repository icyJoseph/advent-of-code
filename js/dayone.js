const fs = require("fs");
const path = require("path");

const fuelCalc = mass => Math.floor(mass / 3) - 2;

const realFuelCalc = mass => {
  const fuel = fuelCalc(mass);

  if (fuel <= 0) {
    return 0;
  }

  return fuel + realFuelCalc(fuel);
};

fs.readFile(
  path.resolve(__dirname, "../", "input/day_one.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const total = data
      .split("\n")
      .reduce((acc, curr) => realFuelCalc(curr) + acc, 0);

    return console.log(total);
  }
);
