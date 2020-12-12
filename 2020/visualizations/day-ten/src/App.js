import { Fragment, useEffect, useRef, useState, useMemo, memo } from "react";
import { Stage, Layer, Rect } from "react-konva";

import worker from "workerize-loader!./worker"; // eslint-disable-line import/no-webpack-loader-syntax

import "./App.css";

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const countOccupied = (grid) =>
  grid.reduce(
    (prev, row) =>
      prev + row.reduce((acc, seat) => (seat === "#" ? acc + 1 : acc), 0),
    0
  );

const Floor = memo(({ x, y, size = 5 }) => {
  return (
    <Rect width={size} height={size} x={x * size} y={y * size} fill="#383888" />
  );
});

const Node = memo(({ x, y, size = 5, value }) => {
  return (
    <Rect
      width={size}
      height={size}
      x={x * size}
      y={y * size}
      fill={value === "#" ? "#785EF0" : "#648FFF"}
    />
  );
});

const workerInstance = worker();

const Grid = ({ done }) => {
  const [cursor, setCursor] = useState(0);

  const grid = useRef([]);

  useEffect(() => {
    const handler = ({ data }) => {
      if (data.type === "grid") {
        setCursor(0);
        return grid.current.push(data.grid);
      }
    };

    workerInstance.addEventListener("message", handler, { passive: true });

    return () => {
      workerInstance.removeEventListener("message", handler, { passive: true });
    };
  }, []);

  useEffect(() => {
    if (done) {
      if (cursor < grid.current.length - 1) {
        const raf = window.requestAnimationFrame(() => {
          setCursor((x) => x + 1);
        });
        return () => {
          window.cancelAnimationFrame(raf);
        };
      }
    } else {
      grid.current = [];
    }
  }, [cursor, done]);

  const current = useMemo(
    () =>
      done
        ? grid.current[cursor]?.split("\n").map((row) => row.split("")) ?? []
        : [],
    [done, cursor]
  );

  const occupied = useMemo(() => (current ? countOccupied(current) : 0), [
    current
  ]);

  const size = 5;

  const height = current.length;
  const width = grid.current.length + 10;

  return (
    <Fragment>
      <section>
        {!!occupied && (
          <span>
            <p>{occupied}</p>
          </span>
        )}
      </section>
      <Stage
        className={done ? "" : "hidden"}
        width={width * size || 100}
        height={height * size || 100}
      >
        <Layer>
          {current.map((row, y) =>
            row.map((seat, x) => {
              if (seat === ".")
                return <Floor key={`${x}.${y}`} x={x} y={y} size={size} />;
              return (
                <Node key={`${x}.${y}`} x={x} y={y} value={seat} size={size} />
              );
            })
          )}
        </Layer>
      </Stage>
    </Fragment>
  );
};

export const App = () => {
  const txtArea = useRef(null);
  const [done, setDone] = useState(false);
  const [solving, setSolving] = useState(false);
  const [num, setNum] = useState(0);

  useEffect(() => {
    if (solving) {
      const timer = setInterval(() => {
        setNum((x) => (x + 1) % 4);
      }, 250);

      return () => clearInterval(timer);
    }
  }, [solving]);

  useEffect(() => {
    const handler = () => {
      const input = txtArea.current;
      if (input) {
        input.focus();
      }
    };
    window.addEventListener("visibilitychange", handler);
    return () => window.removeEventListener("visibilitychange", handler);
  });

  const submit = async () => {
    const value = txtArea.current.value;
    if (!value) return "";
    if (!value.trim()) return "";
    try {
      setDone(false);
      setSolving(true);
      const raw = value.trim().split("\n");
      await workerInstance.runner(raw);
      setDone(true);
      setSolving(false);
      await sleep(1000);
    } catch (e) {
      return;
    }
  };

  return (
    <Fragment>
      <header>
        <h1>AoC Day 11</h1>
        <span className="input-link">
          Get your input{" "}
          <a
            href="https://adventofcode.com/2020/day/11/input"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
        </span>
      </header>
      <main>
        <section>
          <textarea
            rows={1}
            ref={txtArea}
            placeholder="Paste here!"
            spellCheck="false"
          />
          <button onClick={submit}>Simulate</button>
        </section>
        <section>
          {solving && (
            <div className="solving">
              <span className="emoji" role="img" aria-label="Thinking Hard">
                🤔
              </span>{" "}
              <span className="repeat" data-repeat={".".repeat(num)}>
                solving
              </span>
            </div>
          )}
          <Grid done={done} />
        </section>
      </main>
    </Fragment>
  );
};

export default App;
