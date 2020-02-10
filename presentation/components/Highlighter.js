import React from "react";
import { Prism } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/styles/prism";

export const Highlighter = ({ language, children }) => (
  <Prism
    language={language}
    style={atomDark}
    customStyle={{ fontSize: "0.5em" }}
  >
    {children}
  </Prism>
);
