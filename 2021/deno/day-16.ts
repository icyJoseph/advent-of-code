const input = await Deno.readTextFile("./input/day-16.in");
// const input = await Deno.readTextFile("./input/example.in");

const dict: Record<string, string> = {
  0: "0000",
  1: "0001",
  2: "0010",
  3: "0011",
  4: "0100",
  5: "0101",
  6: "0110",
  7: "0111",
  8: "1000",
  9: "1001",
  A: "1010",
  B: "1011",
  C: "1100",
  D: "1101",
  E: "1110",
  F: "1111"
};

const hexSeq = input.split("");

const bitSeq = hexSeq
  .map((h) => dict[h])
  .flat(1)
  .join("");

type Packet = {
  version: number;
  type: number;
  value: number | null;
  children: Packet[];
};

const isPadding = (seq: string, cursor: number) =>
  seq
    .slice(cursor)
    .split("")
    .every((n) => n === "0");

const createPacket = (version: number, type: string): Packet => {
  return {
    version,
    type: parseInt(type, 2),
    value: null,
    children: []
  };
};

const extractHeader = (seq: string, cursor: number) => {
  const version = parseInt(seq.slice(cursor, cursor + 3), 2);

  cursor = cursor + 3;

  const type = seq.slice(cursor, cursor + 3);

  cursor = cursor + 3;

  return [{ type, version }, cursor] as const;
};

const operatorType = (seq: string, cursor: number) => {
  let lengthId = seq[cursor];
  cursor = cursor + 1;

  const step = lengthId === "0" ? 15 : 11;
  const byFn = lengthId === "0" ? byLength : byCount;

  return [{ byFn, step }, cursor] as const;
};

function byValue(seq: string, cursor: number) {
  const numBits = [];

  while (1) {
    const group = seq.slice(cursor, cursor + 5);
    cursor = cursor + 5;
    numBits.push(group);
    if (group.startsWith("0")) {
      break;
    }
  }

  const binNumber = numBits.reduce((prev, curr) => {
    const [, ...rest] = curr.split("");
    return `${prev}${rest.join("")}`;
  }, "");

  return [parseInt(binNumber, 2), cursor] as const;
}

function byLength(seq: string, cursor: number, binLength: string) {
  const length = parseInt(binLength, 2);
  const initCursor = cursor;
  const packets = [];

  while (length > cursor - initCursor) {
    if (isPadding(seq, cursor)) {
      cursor = seq.length;
      break;
    }
    const [{ version, type }, nextCursor] = extractHeader(seq, cursor);

    cursor = nextCursor;

    const packet = createPacket(version, type);

    if (type === "100") {
      const [value, nextCursor] = byValue(seq, cursor);
      packet.value = value;
      cursor = nextCursor;
    } else {
      // operator types
      const [{ byFn, step }, next] = operatorType(seq, cursor);

      cursor = next;

      const workingBits = seq.slice(cursor, cursor + step);
      cursor = cursor + step;

      const [children, nextCursor] = byFn(seq, cursor, workingBits);

      packet.children = children;
      cursor = nextCursor;
    }
    packets.push(packet);
  }

  return [packets, cursor] as const;
}

function byCount(seq: string, cursor: number, binCount: string) {
  const count = parseInt(binCount, 2);

  const packets = [];

  while (packets.length < count) {
    if (isPadding(seq, cursor)) {
      cursor = seq.length;
      break;
    }
    const [{ version, type }, nextCursor] = extractHeader(seq, cursor);

    cursor = nextCursor;

    const packet = createPacket(version, type);

    if (type === "100") {
      const [value, nextCursor] = byValue(seq, cursor);
      packet.value = value;
      cursor = nextCursor;
    } else {
      // operator types
      const [{ byFn, step }, next] = operatorType(seq, cursor);

      cursor = next;

      const workingBits = seq.slice(cursor, cursor + step);
      cursor = cursor + step;

      const [children, nextCursor] = byFn(seq, cursor, workingBits);

      packet.children = children;
      cursor = nextCursor;
    }
    packets.push(packet);
  }

  return [packets, cursor] as const;
}

function process(seq: string) {
  let cursor = 0;

  const packets = [];

  while (1) {
    if (cursor >= seq.length || isPadding(seq, cursor)) {
      break;
    }

    const [{ version, type }, nextCursor] = extractHeader(seq, cursor);

    cursor = nextCursor;

    const packet = createPacket(version, type);

    if (type === "100") {
      const [value, nextCursor] = byValue(seq, cursor);
      packet.value = value;
      cursor = nextCursor;
    } else {
      // operator types
      const [{ byFn, step }, next] = operatorType(seq, cursor);

      cursor = next;

      const workingBits = seq.slice(cursor, cursor + step);
      cursor = cursor + step;

      const [children, nextCursor] = byFn(seq, cursor, workingBits);

      packet.children = children;
      cursor = nextCursor;
    }

    packets.push(packet);
  }
  return packets;
}

const packets = process(bitSeq);

const addPacketVersions = (packets: Packet[]): number => {
  if (packets.length === 0) return 0;

  return packets.reduce((prev, curr) => {
    return prev + curr.version + addPacketVersions(curr.children);
  }, 0);
};

/**
 * Part One
 */
console.log("Part One:", addPacketVersions(packets));

function withPacketValue(packet: Packet): Packet & { value: number } {
  switch (packet.type) {
    case 0:
      return {
        ...packet,
        value: packet.children.reduce(
          (prev, curr) => withPacketValue(curr).value + prev,
          0
        )
      };
    case 1:
      return {
        ...packet,
        value: packet.children.reduce(
          (prev, curr) => withPacketValue(curr).value * prev,
          1
        )
      };
    case 2:
      return {
        ...packet,
        value: Math.min(
          ...packet.children.map((curr) => withPacketValue(curr).value)
        )
      };
    case 3:
      return {
        ...packet,
        value: Math.max(
          ...packet.children.map((curr) => withPacketValue(curr).value)
        )
      };
    case 4:
      // might skip?
      return { ...packet, value: packet.value || Infinity };
    case 5: {
      const left = packet.children[0];
      const right = packet.children[1];

      return {
        ...packet,
        value:
          withPacketValue(left).value > withPacketValue(right).value ? 1 : 0
      };
    }
    case 6: {
      const left = packet.children[0];
      const right = packet.children[1];

      return {
        ...packet,
        value:
          withPacketValue(left).value < withPacketValue(right).value ? 1 : 0
      };
    }
    case 7: {
      const left = packet.children[0];
      const right = packet.children[1];

      return {
        ...packet,
        value:
          withPacketValue(left).value === withPacketValue(right).value ? 1 : 0
      };
    }
    default:
      throw new Error("Unexpected type");
  }
}

/**
 * Part Two
 */
console.log("Part Two:", withPacketValue(packets[0]).value);
