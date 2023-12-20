const pathname = new URL("", import.meta.url).pathname;
const filename = pathname
  ?.split("/")
  .at(-1)
  ?.replace(".ts", "");

const isExample = Deno.args.includes("--example");

/**
 * Helpers
 */

function gcd(a: number, b: number) {
  if (!b) return b === 0 ? a : NaN;
  return gcd(b, a % b);
}

function lcm(a: number, b: number) {
  return (a / gcd(a, b)) * b;
}

const solve = async (path: string) => {
  const input = await Deno.readTextFile(path);

  /**
   * Part One
   */

  type Notify = void;
  type Module =
    | {
        name: string;
        listeners: string[];
        type: "%";
        getCounter: () => { low: number; high: number };
        rcv: (pulse: boolean) => Notify | undefined;
        send: () => string[];
      }
    | {
        name: string;
        listeners: string[];
        type: "&";
        getCounter: () => { low: number; high: number };
        getInputs: () => void;
        rcv: (
          pulse: boolean,
          from: string
        ) => Notify | undefined;
        send: () => string[];
        getNextPulse: () => boolean;
      }
    | {
        name: string;
        listeners: string[];
        type: "broadcaster";
        getCounter: () => { low: number; high: number };
        rcv: (pulse: boolean) => Notify;
        send: (pulse: boolean) => string[];
      }
    | {
        name: string;
        listeners: string[];
        type: "rx";
        getCounter: () => { low: number; high: number };
        rcv: (pulse: boolean) => Notify | undefined;
        send: () => string[];
      };

  /**
   Flip-flop modules (prefix %) are either on or off; 
   
   they are initially off. If a flip-flop module receives a high pulse, 
   it is ignored and nothing happens. 
  
   However, if a flip-flop module receives a low pulse, 
   it flips between on and off. 
   If it was off, it turns on and sends a high pulse. 
   
   If it was on, it turns off and sends a low pulse.


   */
  const createFF = ({
    name,
    listeners,
    map,
  }: {
    name: string;
    listeners: string[];
    map: Record<string, Module>;
  }): Module => {
    let state = false;
    const counter = { low: 0, high: 0 };
    const q: boolean[] = [];

    return {
      name,
      type: "%",
      listeners,
      getCounter() {
        return counter;
      },
      rcv(pulse: boolean) {
        q.push(pulse);
      },
      send() {
        const pulse = q.shift();

        if (pulse) return [];

        state = !state;

        const work: string[] = [];

        listeners.forEach((dest) => {
          if (state) counter.high++;
          else counter.low++;
          //   console.log(name, "->", state, "->", dest);
          map[dest].rcv(state, name);
          work.push(dest);
        });

        return work;
      },
    };
  };

  /*
Conjunction modules (prefix &) remember the type of the most recent pulse received
 from each of their connected input modules; 
 they initially default to remembering a low pulse for each input. 
 
 When a pulse is received, 
 the conjunction module first updates its memory for that input. 
 
 Then, if it remembers high pulses for all inputs, 
 it sends a low pulse; 
 
 otherwise, it sends a high pulse.
  */
  const createCM = ({
    name,
    listeners,
    map,
  }: {
    name: string;
    listeners: string[];
    map: Record<string, Module>;
  }): Module => {
    const memory = new Map<string, boolean>();

    const counter = { low: 0, high: 0 };

    return {
      name,
      type: "&",
      listeners,
      getCounter() {
        return counter;
      },
      getNextPulse() {
        const nextPulse = !Array.from(
          memory.values()
        ).every((x) => x);
        return nextPulse;
      },
      getInputs() {
        Object.entries(map).forEach(([key, value]) => {
          if (value.listeners.find((m) => m === name)) {
            memory.set(key, false);
          }
        });
      },
      //   inputs,
      rcv(pulse: boolean, from: string) {
        memory.set(from, pulse);
      },
      send() {
        const nextPulse = !Array.from(
          memory.values()
        ).every((x) => x);

        const work: string[] = [];

        listeners.forEach((dest) => {
          //   console.log(name, "->", nextPulse, "->", dest);
          if (nextPulse) counter.high++;
          else counter.low++;
          map[dest].rcv(nextPulse, name);

          work.push(dest);
        });
        return work;
      },
    };
  };

  const createBroadcaster = ({
    name,
    listeners,
    map,
  }: {
    name: string;
    listeners: string[];
    map: Record<string, Module>;
  }): Module => {
    const counter = { low: 0, high: 0 };

    return {
      name,
      type: "broadcaster",
      listeners,
      getCounter() {
        return counter;
      },
      rcv() {},
      send(pulse: boolean) {
        const work: string[] = [];
        listeners.forEach((dest) => {
          if (pulse) counter.high++;
          else counter.low++;
          //   console.log(name, "->", pulse, "->", dest);
          map[dest].rcv(pulse, dest);
          work.push(dest);
        });

        return work;
      },
    };
  };

  const map: Record<string, Module> = {};
  map.rx = {
    type: "rx",
    name: "rx",
    listeners: [],
    send() {
      return [];
    },
    rcv(pulse) {
      if (!pulse) throw 0;
    },
    getCounter() {
      return { low: 0, high: 0 };
    },
  };

  const mods = input.split("\n").map((row) => {
    const [lhs, rhs] = row.split(" -> ");

    const listeners = rhs.replaceAll(" ", "").split(",");

    if (lhs.startsWith("&")) {
      return createCM({
        name: lhs.replace("&", ""),
        listeners,
        map,
      });
    }
    if (lhs.startsWith("%")) {
      return createFF({
        name: lhs.replace("%", ""),
        listeners,
        map,
      });
    }

    return createBroadcaster({ name: lhs, listeners, map });
  });

  mods.forEach((curr) => {
    map[curr.name] = curr;
  });

  mods.forEach((mod) => {
    if (mod.type === "&") {
      mod.getInputs();
    }
  });

  //   console.log(mods);

  let buttonPulse = 0;
  let p1Done = false;

  const periods = [0, 0, 0, 0];

  outer: while (true) {
    for (let i = 0; i < 1000; i++) {
      buttonPulse++;
      let work = map["broadcaster"].send(false);

      while (work.length !== 0) {
        work = work.flatMap((dest) => {
          return map[dest].send(!!{});
        });

        if (!isExample && buttonPulse > 1) {
          if (
            map["kd"].type === "&" &&
            map["kd"].getNextPulse()
          ) {
            periods[0] = buttonPulse;
          }

          if (
            map["zf"].type === "&" &&
            map["zf"].getNextPulse()
          ) {
            periods[1] = buttonPulse;
          }

          if (
            map["vg"].type === "&" &&
            map["vg"].getNextPulse()
          ) {
            periods[2] = buttonPulse;
          }

          if (
            map["gs"].type === "&" &&
            map["gs"].getNextPulse()
          ) {
            periods[3] = buttonPulse;
          }
        }
        if (periods.every((x) => x !== 0)) break outer;
      }
    }

    if (p1Done) continue;
    let totalLow = buttonPulse;
    let totalHigh = 0;

    mods.forEach((mod) => {
      const { low, high } = mod.getCounter();

      totalLow += low;
      totalHigh += high;
    });

    console.log("Part 1:", totalHigh * totalLow);
    p1Done = true;
    if (isExample) break;
  }
  if (!isExample) {
    console.log("Part 2:", periods.reduce(lcm));
  }

  /**
   * Part Two
   */
};

console.log("Day", filename);
if (isExample) {
  console.log("Example");
  await solve(`./input/example.in`);
  console.log("---");
} else {
  await solve(`./input/${filename}.in`);
}
