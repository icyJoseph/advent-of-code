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
  type: string;
  value: number | null;
  children: Packet[];
};

const createPacket = (version: number, type: string): Packet => {
  return {
    version,
    type,
    value: null,
    children: []
  };
};

function byLength(seq: string, cursor: number, binLength: string) {
  const length = parseInt(binLength, 2);
  const initCursor = cursor;
  const packets = [];

  while (length > cursor - initCursor) {
    if (
      seq
        .slice(cursor)
        .split("")
        .every((n) => n === "0")
    ) {
      cursor = seq.length;
      break;
    }
    const version = parseInt(seq.slice(cursor, cursor + 3), 2);

    cursor = cursor + 3;

    const type = seq.slice(cursor, cursor + 3);

    cursor = cursor + 3;

    const packet = createPacket(version, type);

    if (type === "100") {
      // take 5 until the last group starts with zero
      let numBits = [];

      while (1) {
        let group = seq.slice(cursor, cursor + 5);
        cursor = cursor + 5;

        numBits.push(group);
        if (group.startsWith("0")) {
          break;
        }
      }

      let binNumber = numBits.reduce((prev, curr) => {
        const [, ...rest] = curr.split("");
        return `${prev}${rest.join("")}`;
      }, "");

      packet.value = parseInt(binNumber, 2);

      packets.push(packet);
    } else {
      // operator types
      let lengthId = seq[cursor];
      cursor = cursor + 1;
      if (lengthId === "0") {
        // take next 15 bits
        // total length in bits of subpackets
        let subPacketBits = seq.slice(cursor, cursor + 15);
        cursor = cursor + 15;

        const [children, nextCursor] = byLength(seq, cursor, subPacketBits);

        packet.children = children;
        packets.push(packet);

        cursor = nextCursor;
      } else {
        // lengthId === '1'
        // take next 11 bits
        // number of sub packets
        let subPacketBits = seq.slice(cursor, cursor + 11);
        cursor = cursor + 11;

        const [children, nextCursor] = byCount(seq, cursor, subPacketBits);
        packet.children = children;
        packets.push(packet);

        cursor = nextCursor;
      }
    }
  }

  return [packets, cursor] as const;
}

function byCount(seq: string, cursor: number, binCount: string) {
  const count = parseInt(binCount, 2);

  const packets = [];

  while (packets.length < count) {
    if (
      seq
        .slice(cursor)
        .split("")
        .every((n) => n === "0")
    ) {
      cursor = seq.length;
      break;
    }
    const version = parseInt(seq.slice(cursor, cursor + 3), 2);

    cursor = cursor + 3;

    const type = seq.slice(cursor, cursor + 3);

    cursor = cursor + 3;

    const packet = createPacket(version, type);

    if (type === "100") {
      // take 5 until the last group starts with zero
      let numBits = [];

      while (1) {
        let group = seq.slice(cursor, cursor + 5);
        cursor = cursor + 5;

        numBits.push(group);
        if (group.startsWith("0")) {
          break;
        }
      }

      let binNumber = numBits.reduce((prev, curr) => {
        const [, ...rest] = curr.split("");
        return `${prev}${rest.join("")}`;
      }, "");

      packet.value = parseInt(binNumber, 2);

      packets.push(packet);
    } else {
      // operator types
      let lengthId = seq[cursor];
      cursor = cursor + 1;
      if (lengthId === "0") {
        // take next 15 bits
        // total length in bits of subpackets
        let subPacketBits = seq.slice(cursor, cursor + 15);
        cursor = cursor + 15;

        const [children, nextCursor] = byLength(seq, cursor, subPacketBits);
        packet.children = children;

        packets.push(packet);

        cursor = nextCursor;
      } else {
        // lengthId === '1'
        // take next 11 bits
        // number of sub packets
        let subPacketBits = seq.slice(cursor, cursor + 11);
        cursor = cursor + 11;

        const [children, nextCursor] = byCount(seq, cursor, subPacketBits);
        packet.children = children;

        packets.push(packet);

        cursor = nextCursor;
      }
    }
  }

  return [packets, cursor] as const;
}

let cursor = 0;

const packets = [];

while (1) {
  if (cursor >= bitSeq.length) {
    break;
  }

  if (
    bitSeq
      .slice(cursor)
      .split("")
      .every((n) => n === "0")
  ) {
    // reached the padding
    break;
  }

  let version = parseInt(bitSeq.slice(cursor, cursor + 3), 2);

  cursor = cursor + 3;
  let type = bitSeq.slice(cursor, cursor + 3);
  cursor = cursor + 3;

  const packet = createPacket(version, type);

  if (type === "100") {
    // take 5 until the last group starts with zero
    let numBits = [];

    while (1) {
      let group = bitSeq.slice(cursor, cursor + 5);
      cursor = cursor + 5;
      numBits.push(group);
      if (group.startsWith("0")) {
        break;
      }
    }

    let binNumber = numBits.reduce((prev, curr) => {
      const [, ...rest] = curr.split("");
      return `${prev}${rest.join("")}`;
    }, "");

    packet.value = parseInt(binNumber, 2);

    packets.push(packet);
  } else {
    // operator types
    let lengthId = bitSeq[cursor];
    cursor = cursor + 1;
    if (lengthId === "0") {
      // take next 15 bits
      // total length in bits of subpackets
      let subPacketBits = bitSeq.slice(cursor, cursor + 15);
      cursor = cursor + 15;

      const [children, nextCursor] = byLength(bitSeq, cursor, subPacketBits);

      packet.children = children;

      packets.push(packet);

      cursor = nextCursor;
    } else {
      // lengthId === '1'
      // take next 11 bits
      // number of sub packets
      let subPacketBits = bitSeq.slice(cursor, cursor + 11);
      cursor = cursor + 11;

      const [children, nextCursor] = byCount(bitSeq, cursor, subPacketBits);
      packet.children = children;

      packets.push(packet);

      cursor = nextCursor;
    }
  }
}

const addVersion = (packets: Packet[]): number => {
  if (packets.length === 0) return 0;

  return packets.reduce((prev, curr) => {
    return prev + curr.version + addVersion(curr.children);
  }, 0);
};

/**
 * Part One
 */
console.log("Part One:", addVersion(packets));

/**
 * Part Two
 */
console.log("Part Two:");
