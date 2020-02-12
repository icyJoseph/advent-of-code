import React from "react";
import Audio from "../assets/crawl.mp3";
import "./style.css";

export const Crawl = ({ title = "", subtitle = "", paragraphs = [] }) => {
  const [start, setStart] = React.useState(false);
  const [play, setPlay] = React.useState(false);
  const _ref = React.useRef();

  React.useEffect(() => {
    const handler = () => {
      setStart(true);
    };

    const el = _ref.current;

    el.addEventListener("canplay", handler);

    return () => {
      el.removeEventListener("canplay", handler);
    };
  }, []);

  React.useEffect(() => {
    if (start) {
      setTimeout(() => {
        _ref.current.play();
        setPlay(true);
      }, 7000);
    }
  }, [start]);

  return (
    <>
      <audio preload="auto" ref={_ref}>
        <source src={Audio} type="audio/mpeg" />
      </audio>
      {start && (
        <section className="intro">
          A long time ago, in a galaxy far,
          <br />
          far away...
        </section>
      )}
      {play && (
        <>
          <section className="logo">
            Advent of <br />
            Code 2019
          </section>

          <section className="star-wars">
            <div className="crawl">
              <div className="title">
                <p>{title}</p>
                <h1>{subtitle}</h1>
              </div>

              {paragraphs.map((text, index) => (
                <p key={index}>{text}</p>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
};
