import React from "react";
import { Prism } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/styles/prism";

export const Highlighter = ({
  language,
  children,
  fontSize = "0.5em",
  custom = {}
}) => (
  <Prism
    language={language}
    style={atomDark}
    customStyle={{ fontSize, ...custom }}
  >
    {children}
  </Prism>
);
