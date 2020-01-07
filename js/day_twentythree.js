const fs = require("fs");
const path = require("path");
const intCode = require("./intCode");

function Buffer(address) {
  return {
    addr: address,
    q: [],
    _q: [],
    readEmptyQ: 0,
    buff(x, y) {
      this._q.push(x, y);
    },
    flush() {
      this.q = [...this.q, ...this._q];
      this._q = [];
    },
    overwrite(x, y) {
      this.q = [x, y];
    },
    drain() {
      const ret = [...this.q];
      this.q = [];
      return ret;
    },
    read() {
      if (this.q.length === 0) {
        this.readEmptyQ = this.readEmptyQ + 1;
        return -1;
      }

      const ret = this.q.shift();
      this.readEmptyQ = 0;
      return ret;
    },
    isIdle() {
      return (
        this.q.length === 0 && this._q.length === 0 && this.readEmptyQ > 1000
      );
    },
    inspect() {
      console.log("Inspect", {
        address,
        q: this.q,
        _q: this._q
      });
    }
  };
}

function NetworkInterfaceController(data, address, bus) {
  let program = [...data.split(",").map(x => intCode.parseCell(x))];
  let output = [];

  return it => {
    try {
      output = intCode.runner(program, address, bus[address]);
      if (output.length === 3) {
        const [dest, x, y] = output;

        console.log(it, `${address} -> [x:${x}, y:${y}] -> ${dest}`);

        if (dest === "255") {
          bus.monitor.overwrite(x, y);
        } else {
          bus[parseInt(dest)].buff(x, y);
        }
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

    const NAT = Array.from({ length: 50 }, (_, i) => new Buffer(i));

    NAT.monitor = new Buffer(255);

    const network = Array.from({ length: 50 }, (_, i) => {
      return new NetworkInterfaceController(data, i, NAT);
    });

    const natY = [];
    let it = 0;
    let idleNat = "";
    try {
      while (1) {
        NAT.forEach(buffer => buffer.flush());

        network.forEach(runner => runner(it));

        const idle = NAT.every(buffer => buffer.isIdle());

        const idle_ = NAT.filter(buff => buff.isIdle())
          .map(buffer => buffer.addr)
          .join(",");

        if (idleNat !== idle_) {
          console.log(it, "Idle:", idle_);
          idleNat = idle_;
          NAT.monitor.inspect();
        }

        if (idle) {
          const [x, y] = NAT.monitor.drain();
          console.log(it, "All IDLE. Sending:", { x, y });

          if (y && x) {
            natY.push(y);

            if (natY[natY.length - 2] === natY[natY.length - 1]) {
              throw natY[natY.length - 2];
            }

            NAT[0].buff(x, y);
          }
        }
        it = it + 1;
      }
    } catch (e) {
      console.log("First successive Y", e);
    }
  }
);
