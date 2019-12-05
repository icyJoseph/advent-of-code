const fs = require("fs");
const path = require("path");

const positionMode = "0";
const immediateMode = "1";
const operations = ["1", "2", "3", "4", "5", "6", "7", "8", "99"];

const mutateMemory = (
  memory,
  {
    operation,
    firstInputMode = positionMode,
    secondInputMode = positionMode,
    thirdInputMode = positionMode
  },
  index,
  input
) => {
  if (operation === "99") {
    throw new Error("HALT");
  }
  const first = index + 1;
  const second = index + 2;
  const third = index + 3;

  switch (operation) {
    case "1":
      const leftSum =
        immediateMode === firstInputMode
          ? memory[first].cell
          : memory[memory[first].cell].cell;
      const rightSum =
        immediateMode === secondInputMode
          ? memory[second].cell
          : memory[memory[second].cell].cell;

      memory[
        immediateMode === thirdInputMode ? third : memory[third].cell
      ] = parseCell(`${parseInt(leftSum) + parseInt(rightSum)}`);
      return { skip: 4 };
    case "2":
      const factorA =
        immediateMode === firstInputMode
          ? memory[first].cell
          : memory[memory[first].cell].cell;
      const factorB =
        immediateMode === secondInputMode
          ? memory[second].cell
          : memory[memory[second].cell].cell;

      memory[
        immediateMode === thirdInputMode ? third : memory[third].cell
      ] = parseCell(`${parseInt(factorA) * parseInt(factorB)}`);
      return { skip: 4 };
    case "3":
      const write =
        immediateMode === firstInputMode ? first : memory[first].cell;
      memory[parseInt(write)] = parseCell(`${input}`);

      return { skip: 2 };
    case "4":
      const read =
        immediateMode === firstInputMode ? first : memory[first].cell;
      return { skip: 2, data: memory[read].cell };
    case "5":
      // jump if true
      const firstNonZero =
        immediateMode === firstInputMode
          ? memory[first].cell
          : memory[memory[first].cell].cell;
      const pointer =
        immediateMode === secondInputMode
          ? memory[second].cell
          : memory[memory[second].cell].cell;

      if (parseInt(firstNonZero) !== 0) {
        return { jumpTo: parseInt(pointer) };
      }
      return { skip: 3 };

    case "6":
      // jump if false
      const firstZero =
        immediateMode === firstInputMode
          ? memory[first].cell
          : memory[memory[first].cell].cell;
      const jumpTo =
        immediateMode === secondInputMode
          ? memory[second].cell
          : memory[memory[second].cell].cell;

      if (parseInt(firstZero) === 0) {
        return { jumpTo: parseInt(jumpTo) };
      }
      return { skip: 3 };

    case "7":
      const lesser =
        immediateMode === firstInputMode
          ? memory[first].cell
          : memory[memory[first].cell].cell;
      const greater =
        immediateMode === secondInputMode
          ? memory[second].cell
          : memory[memory[second].cell].cell;

      memory[
        immediateMode === thirdInputMode ? third : memory[third].cell
      ] = parseCell(lesser < greater ? "1" : "0");

      return { skip: 4 };

    case "8":
      const equalLeft =
        immediateMode === firstInputMode
          ? memory[first].cell
          : memory[memory[first].cell].cell;
      const equalRight =
        immediateMode === secondInputMode
          ? memory[second].cell
          : memory[memory[second].cell].cell;

      memory[
        immediateMode === thirdInputMode ? third : memory[third].cell
      ] = parseCell(equalLeft === equalRight ? "1" : "0");

      return { skip: 4 };
    default:
      console.log("Error");
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
        cell: parseInt(cell),
        secondInputMode,
        firstInputMode,
        thirdInputMode
      };
    }
  }
  return { cell };
}

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
