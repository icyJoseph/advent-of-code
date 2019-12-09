const fs = require("fs");
const path = require("path");

const positionMode = "0";
const immediateMode = "1";
const relativeMode = "2";
const operations = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "99"];

const emptyMemory = { cell: "0" };

const readOrEmpty = (memory, index) =>
  memory[parseInt(index)] ? memory[parseInt(index)] : { ...emptyMemory };

function operationMode(mode, index, memory, relativeBase) {
  switch (mode) {
    case positionMode:
      return readOrEmpty(
        memory,
        operationModeIO(mode, index, memory, relativeBase)
      ).cell;
    case immediateMode:
      return readOrEmpty(
        memory,
        operationModeIO(mode, index, memory, relativeBase)
      ).cell;
    case relativeMode:
      return readOrEmpty(
        memory,
        parseInt(operationModeIO(mode, index, memory, relativeBase))
      ).cell;
    default:
      throw new Error("Bad MODE");
  }
}

function operationModeIO(mode, index, memory, relativeBase) {
  switch (mode) {
    case positionMode:
      return parseInt(readOrEmpty(memory, index).cell);
    case immediateMode:
      return index;
    case relativeMode:
      return (
        parseInt(relativeBase) +
        parseInt(readOrEmpty(memory, parseInt(index)).cell)
      );
    default:
      throw new Error("Bad MODE");
  }
}

const mutateMemory = (
  memory,
  {
    operation,
    firstInputMode = positionMode,
    secondInputMode = positionMode,
    thirdInputMode = positionMode
  },
  index,
  input,
  relativeBase
) => {
  if (operation === "99") {
    throw new Error("HALT");
  }

  const first = index + 1;
  const second = index + 2;
  const third = index + 3;

  switch (operation) {
    case "1":
      const leftSum = operationMode(
        firstInputMode,
        first,
        memory,
        relativeBase
      );

      const rightSum = operationMode(
        secondInputMode,
        second,
        memory,
        relativeBase
      );

      memory[
        operationModeIO(thirdInputMode, third, memory, relativeBase)
      ] = parseCell(`${BigInt(leftSum) + BigInt(rightSum)}`);

      return { skip: 4 };
    case "2":
      const factorA = operationMode(
        firstInputMode,
        first,
        memory,
        relativeBase
      );

      const factorB = operationMode(
        secondInputMode,
        second,
        memory,
        relativeBase
      );

      memory[
        operationModeIO(thirdInputMode, third, memory, relativeBase)
      ] = parseCell(`${BigInt(factorA) * BigInt(factorB)}`);

      return { skip: 4 };
    case "3":
      memory[
        operationModeIO(firstInputMode, first, memory, relativeBase)
      ] = parseCell(`${input}`);

      return { skip: 2 };

    case "4":
      const read = operationModeIO(firstInputMode, first, memory, relativeBase);

      return { skip: 2, data: readOrEmpty(memory, read).cell };
    case "5":
      // jump if true
      const firstNonZero = operationMode(
        firstInputMode,
        first,
        memory,
        relativeBase
      );

      const pointer = operationMode(
        secondInputMode,
        second,
        memory,
        relativeBase
      );

      if (parseInt(firstNonZero) !== 0) {
        return { jumpTo: parseInt(pointer) };
      }
      return { skip: 3 };

    case "6":
      // jump if false
      const firstZero = operationMode(
        firstInputMode,
        first,
        memory,
        relativeBase
      );

      const jumpTo = operationMode(
        secondInputMode,
        second,
        memory,
        relativeBase
      );

      if (parseInt(firstZero) === 0) {
        return { jumpTo: parseInt(jumpTo) };
      }
      return { skip: 3 };

    case "7":
      const lesser = operationMode(firstInputMode, first, memory, relativeBase);

      const greater = operationMode(
        secondInputMode,
        second,
        memory,
        relativeBase
      );

      memory[
        operationModeIO(thirdInputMode, third, memory, relativeBase)
      ] = parseCell(BigInt(lesser) < BigInt(greater) ? "1" : "0");

      return { skip: 4 };

    case "8":
      const equalLeft = operationMode(
        firstInputMode,
        first,
        memory,
        relativeBase
      );

      const equalRight = operationMode(
        secondInputMode,
        second,
        memory,
        relativeBase
      );

      memory[
        operationModeIO(thirdInputMode, third, memory, relativeBase)
      ] = parseCell(BigInt(equalLeft) === BigInt(equalRight) ? "1" : "0");

      return { skip: 4 };
    case "9":
      const baseModifier = operationMode(
        firstInputMode,
        first,
        memory,
        relativeBase
      );

      const newRelativeBase = parseInt(relativeBase) + parseInt(baseModifier);

      return {
        newRelativeBase,
        skip: 2
      };
    default:
      throw new Error("Bad Int Code");
  }
};

function parseCell(cell) {
  if (parseInt(cell) >= 0) {
    const operation =
      cell === "99"
        ? "99"
        : operations.find(mode => {
            if (cell.length === 1) {
              return cell.endsWith(mode);
            }
            if (cell.split("").length >= 2) {
              const [firstDigit, secondDigit] = cell.split("").slice(-2);

              return firstDigit === "0" && mode.includes(secondDigit);
            }
          });

    if (operation) {
      const inputModes = cell
        .substring(0, cell.length - 2)
        .split("")
        .reverse()
        .join("");

      const [
        firstInputMode = positionMode,
        secondInputMode = positionMode,
        thirdInputMode = positionMode
      ] = inputModes;

      return {
        operation,
        cell,
        secondInputMode,
        firstInputMode,
        thirdInputMode
      };
    }
    return { cell };
  }

  return { cell };
}

function solve() {
  fs.readFile(
    path.resolve(__dirname, "../", "input/day_five.in"),
    "utf-8",
    (err, data) => {
      if (err) return console.log(err);

      const memory = data.split(",").map(cell => parseCell(cell));

      let output;
      let input = "5";
      let next = 0;
      let index = 0;

      try {
        outer: while (true) {
          if (next === index) {
            if (memory[index].operation) {
              const { skip = 0, data, jumpTo } = mutateMemory(
                memory,
                memory[index],
                index,
                input
              );
              if (data) output = data;
              if (jumpTo) {
                next = jumpTo;
                index = jumpTo;
                continue outer;
              } else {
                next = next + skip;
              }
            }
          }
          index = index + 1;
        }
      } catch (err) {
        console.log(err);
      } finally {
        console.log("output", output);
      }
    }
  );
}

// solve()

module.exports = { parseCell, mutateMemory };
