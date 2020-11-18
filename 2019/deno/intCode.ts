interface Stream {
  value: number;
}

export const stream = (initial: number): Stream => {
  let _value = initial;
  return {
    set value(e) {
      _value = e;
      return;
    },
    get value() {
      return _value;
    }
  };
};

export type Memory = {
  memory: number[];
  input: number | Stream;
  output: number | Stream;
  cursor: number;
  mode: number;
  relative: number;
  setMode: (mode: number) => void;
  setRelative: (rel: number) => Memory;
  next(mode?: 0 | 1 | 2): number;
  read(): number;
  readAt(position: number): number;
  writeAt(position: number, value: number): Memory;
  write(value: number): Memory;
  tick(): Promise<Memory>;
  tickOnce(): Promise<Memory>;
  tickOutput(): Promise<Memory>;
  setInput(payload: number): Memory;
  readInput(): number;
  setOutput(): Memory;
  readOutput(): number;
  moveCursor(position: number | null): Memory;
  debug: () => Partial<Memory>;
  halted: boolean;
  setHalted: () => void;
};

const isNil = <T>(val: T | null | undefined): val is null | undefined =>
  val !== (val ?? !val);

export function createMemory(
  memory: number[] = [],
  input: number | Stream = 0,
  output: number | Stream = 0,
  cursor: number = 0,
  relative: number = 0
): Memory {
  return {
    memory: [...memory],
    input,
    output,
    cursor,
    mode: 0,
    relative,
    setMode(mode) {
      this.mode = mode;
    },
    setRelative(rel) {
      this.relative = this.relative + rel;
      return this;
    },
    next() {
      const _next = [
        this.memory[this.cursor],
        this.cursor,
        this.memory[this.cursor] + this.relative
      ][this.mode % 10];

      this.mode = Math.floor(this.mode / 10);
      this.cursor = this.cursor + 1;

      return _next;
    },
    read() {
      let next = this.next();
      return this.readAt(next);
    },
    readAt(position) {
      return this.memory[position] ?? 0;
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
      return new Promise((resolve) => {
        try {
          while (1) {
            operations(this);
          }
        } catch (e) {
          resolve(this);
        }
      });
    },
    tickOnce() {
      return new Promise((resolve, reject) => {
        try {
          operations(this);
          resolve(this);
        } catch (e) {
          reject(this);
        }
      });
    },
    tickOutput() {
      return new Promise((resolve) => {
        try {
          while (1) {
            operations(this, true);
          }
        } catch (e) {
          resolve(this);
        }
      });
    },
    setInput(payload) {
      if (typeof this.input === "number") {
        this.input = payload;
        return this;
      }
      this.input.value = payload;
      return this;
    },
    readInput() {
      if (typeof this.input === "number") {
        return this.input;
      }
      return this.input.value;
    },
    setOutput() {
      let next = this.next();
      if (typeof this.output === "number") {
        this.output = this.memory[next] ?? 0;
        return this;
      }
      this.output.value = this.memory[next] ?? 0;
      return this;
    },
    readOutput() {
      if (typeof this.output === "number") {
        return this.output;
      }
      return this.output.value;
    },
    moveCursor(position) {
      if (isNil(position)) return this;
      this.cursor = position;
      return this;
    },
    debug() {
      return {
        input: typeof this.input === "number" ? this.input : this.input.value,
        output:
          typeof this.output === "number" ? this.output : this.output.value,
        cursor: this.cursor,
        relative: this.relative,
        mode: this.mode
      };
    },
    halted: false,
    setHalted() {
      this.halted = true;
    }
  };
}

function operations(memory: Memory, throwOnOutput: boolean = false) {
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
    case 4: {
      if (throwOnOutput) {
        throw memory.setOutput();
      }
      return memory.setOutput();
    }
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
    case 9:
      return memory.setRelative(memory.read());
    case 99:
    default:
      memory.setHalted();
      throw "Halt";
  }
}

export const pipe = (memories: Memory[]) => async (
  initial: number
): Promise<number> => {
  let prev = initial;
  await Promise.all(memories.map((memory) => memory.tickOnce()));

  for await (const memory of memories) {
    memory.setInput(prev);
    await memory.tick();
    prev = memory.readOutput();
  }

  return prev;
};

export const loop = (memories: Memory[]) => async (seed: number) => {
  await Promise.all(memories.map((memory) => memory.tickOnce()));

  memories[0].setInput(seed);

  while (memories.some(({ halted }) => !halted)) {
    for await (const memory of memories) {
      await memory.tickOutput();
    }
  }

  const [last] = memories.slice(-1);

  return last.readOutput();
};
