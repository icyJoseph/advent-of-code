const positionMode = "0";
const immediateMode = "1";
const relativeMode = "2";
const operations = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "99"];

const emptyMemory = { cell: "0" };

const readOrEmpty = (memory, index) =>
  memory[BigInt(index)] ? memory[BigInt(index)] : { ...emptyMemory };

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
        BigInt(operationModeIO(mode, index, memory, relativeBase))
      ).cell;
    default:
      throw new Error("Bad MODE");
  }
}

function operationModeIO(mode, index, memory, relativeBase) {
  switch (mode) {
    case positionMode:
      return BigInt(readOrEmpty(memory, index).cell);
    case immediateMode:
      return index;
    case relativeMode:
      return (
        BigInt(relativeBase) + BigInt(readOrEmpty(memory, BigInt(index)).cell)
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
  relativeBase,
  address
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
      const next = input.read ? input.read(address) : input;
      if (!input.read) {
        console.log("Booting", address);
      }

      memory[
        operationModeIO(firstInputMode, first, memory, relativeBase)
      ] = parseCell(`${next}`);

      return { skip: 2, increaseInputPointer: true };

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

      if (firstNonZero !== "0") {
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

      if (firstZero === "0") {
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

function runner(memory, address, input) {
  let output = [];
  let pointer = 0;
  let relativeBase = 0;
  let running = false;

  if (memory.state) {
    output = memory.state.output;
    pointer = memory.state.pointer;
    relativeBase = memory.state.relativeBase;
    running = memory.state.running;
  }

  try {
    if (memory[pointer].operation) {
      const { skip = 0, data, jumpTo, newRelativeBase } = mutateMemory(
        memory,
        memory[pointer],
        pointer,
        running ? input : address,
        relativeBase,
        address
      );
      running = true;
      if (newRelativeBase !== undefined) {
        relativeBase = newRelativeBase;
      }

      if (data !== undefined) {
        // console.log({ data });
        output.push(data);
      }

      if (jumpTo !== undefined) {
        pointer = jumpTo;
      } else {
        pointer = pointer + skip;
      }
    }
  } catch (err) {
    console.log(err);
    throw err;
  }

  memory.state = {
    output,
    pointer,
    relativeBase,
    running
  };

  return output;
}

module.exports = { runner, parseCell };
