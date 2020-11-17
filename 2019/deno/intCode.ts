type Memory = {
  memory: number[];
  cursor: number;
  input: number;
  output: number;
  mode: number;
  setMode: (mode: number) => void;
  next(mode?: 0 | 1): number;
  read(): number;
  readAt(position: number): number;
  writeAt(position: number, value: number): Memory;
  write(value: number): Memory;
  tick(): Memory;
  setInput(payload: number): Memory;
  readInput(): number;
  setOutput(): Memory;
  readOutput(): number;
  moveCursor(position: number | null): Memory;
};

const readingMode = (mode: number): 0 | 1 => {
  let ret = mode % 10;
  if (ret === 0) return ret;
  return 1;
};

export function createMemory(
  memory: number[] = [],
  cursor: number = 0,
  input = 0,
  output = 0
): Memory {
  return {
    memory: [...memory],
    cursor,
    input,
    output,
    mode: 0,
    setMode(mode) {
      this.mode = mode;
    },
    next() {
      let next;
      let mode = readingMode(this.mode);
      this.mode = Math.floor(this.mode / 10);

      if (mode === 1) {
        next = this.cursor;
      } else {
        next = this.memory[this.cursor];
      }

      this.cursor = this.cursor + 1;
      return next;
    },
    read() {
      let next = this.next();
      return this.readAt(next);
    },
    readAt(position) {
      return this.memory[position];
    },
    write(value) {
      let next = this.next();
      this.memory[next] = value;
      return this;
    },
    writeAt(position, value) {
      this.memory[position] = value;
      return this;
    },
    tick() {
      return operations(this);
    },
    setInput(payload) {
      this.input = payload;
      return this;
    },
    readInput() {
      return this.input;
    },
    setOutput() {
      let next = this.next();
      this.output = this.memory[next];
      return this;
    },
    readOutput() {
      return this.output;
    },
    moveCursor(position) {
      if (isNil(position)) return this;
      this.cursor = position;
      return this;
    }
  };
}

const isNil = <T>(val: T | null | undefined): val is null | undefined =>
  val !== (val ?? !val);

function operations(memory: Memory) {
  const opcode = memory.next();
  const code = opcode % 100;

  memory.setMode(Math.floor(opcode / 100));

  switch (code) {
    case 1:
      return memory.write(memory.read() + memory.read());
    case 2:
      return memory.write(memory.read() * memory.read());
    case 3:
      return memory.write(memory.readInput());
    case 4:
      return memory.setOutput();
    case 5: {
      // jump if true
      let param = memory.read();
      let target = memory.read();
      return memory.moveCursor(param !== 0 ? target : null);
    }
    case 6: {
      // jump if false
      let param = memory.read();
      let target = memory.read();
      return memory.moveCursor(param === 0 ? target : null);
    }
    case 7:
      // less than
      return memory.write(memory.read() < memory.read() ? 1 : 0);
    case 8:
      // equal
      return memory.write(memory.read() === memory.read() ? 1 : 0);
    case 99:
    default:
      throw "Halt";
  }
}
