import React from "react";
import ReactDOM from "react-dom";
import { Memory } from "../memory";

const memory = (window as any).memory as Memory;

function Report() {
  return (
    <div>
      <h1>Raport</h1>
    </div>
  );
}

ReactDOM.render(<Report />, document.getElementById("app"));
