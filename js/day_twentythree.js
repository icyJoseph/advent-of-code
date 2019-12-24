const fs = require("fs");
const path = require("path");
const intCode = require("./intCode");

function Buffer(address) {
  return {
    q: [],
    _q: [],
    buff(x, y) {
      this._q.push(y, x);
    },
    flush() {
      this.q.push(...this._q);
      this._q = [];
    },
    add(x, y) {
      this.q.push(y, x);
    },
    read(reader) {
      const ret = this.q.pop() || -1;
      //   console.log("Reading", address, "Reader", reader, {
      //     ret,
      //     next: this.q,
      //     buffed: this._q
      //   });

      return ret;
    },
    inspect() {
      console.log(this.q, this._q);
    }
  };
}

function NetworkInterfaceController(data, address, bus) {
  let program = [...data.split(",").map(x => intCode.parseCell(x))];

  return () => {
    try {
      const output = intCode.runner(program, address, bus[address]);
      if (output.length === 3) {
        const [dest, x, y] = output;
        // console.log("Output from Address", address, {
        //   output
        // });
        // bus[address].inspect();
        // bus[dest].inspect();

        if (dest === "255") {
          console.log({ x, y });
          throw y;
        }
        bus[parseInt(dest)].buff(x, y);
        program.state.output = [];
      }
    } catch (e) {
      throw e;
    }
  };
}

fs.readFile(
  path.resolve(__dirname, "../", "input/day_twentythree.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const bus = Array.from({ length: 50 }, (_, i) => new Buffer(i));

    const network = Array.from({ length: 50 }, (_, i) => {
      return new NetworkInterfaceController(data, i, bus);
    });

    try {
      while (1) {
        bus.forEach(buffer => buffer.flush());
        network.forEach(network => network());
      }
    } catch (e) {
      console.log("Y", e);
    }
  }
);
