type Memory = {
  memory: number[];
  cursor: number;
  next(): number;
  read(): number;
  readAt(position: number): number;
  writeAt(position: number, value: number): Memory;
  write(value: number): Memory;
  tick(): Memory;
};

export function createMemory(
  memory: number[] = [],
  cursor: number = 0
): Memory {
  return {
    memory: [...memory],
    cursor,
    next() {
      let next = this.memory[this.cursor];
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
    }
  };
}

function operations(memory: Memory) {
  const code = memory.next();
  switch (code) {
    case 1:
      return memory.write(memory.read() + memory.read());
    case 2:
      return memory.write(memory.read() * memory.read());
    case 99:
    default:
      throw "Halt";
  }
}
