import React from "react";
import "./style.css";

export const Crawl = ({
  useIntro = false,
  title = "",
  subtitle = "",
  paragraphs = []
}) => (
  <>
    {useIntro && (
      <>
        <section className="intro">
          A long time ago, in a galaxy far,
          <br />
          far away...
        </section>
        <section className="logo">
          Advent of <br />
          Code 2019
        </section>
      </>
    )}
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
);
