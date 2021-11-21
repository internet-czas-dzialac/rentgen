import React from "react";
import ReactDOM from "react-dom";
import { getMemory } from "../memory";
import { Classifications } from "../stolen-data-entry";
import { reduceConcat, useEmitter } from "../util";
import EmailTemplate from "./email-template";
import HARConverter from "./har-converter";

function Report() {
  const origin = new URL(document.location.toString()).searchParams.get(
    "origin"
  );
  const [counter, setCounter] = useEmitter(getMemory());
  function refresh() {
    setCounter((c) => c + 1);
  }
  const clusters = getMemory().getClustersForOrigin(origin);
  const marks = Object.values(clusters)
    .map((cluster) => cluster.getMarkedRequests())
    .reduce(reduceConcat, [])
    .map((request) => request.getMarkedEntries())
    .reduce(reduceConcat, [])
    .map((entry) => entry.marks)
    .reduce(reduceConcat, []);
  return (
    <div {...{ "data-version": counter }}>
      <h1>Generuj treść maila dla {origin}</h1>
      <table>
        <thead>
          <tr>
            <th>Adres docelowy</th>
            <th>Źródło danych</th>
            <th>Treść danych</th>
            <th>Klasyfikacja</th>
          </tr>
        </thead>
        <tbody>
          {marks.map((mark) => (
            <tr
              key={mark.entry.request.originalURL + ";" + mark.key}
              style={{
                backgroundColor:
                  mark.classification == "id" ? "yellow" : "white",
              }}
            >
              <td>{mark.shorthost}</td>
              <td style={{ overflowWrap: "anywhere" }}>
                {mark.source}:{mark.name}
                {mark.key}
              </td>
              <td
                style={{
                  width: "400px",
                  overflowWrap: "anywhere",
                  backgroundColor: mark.entry.isRelatedToID()
                    ? "#ffff0054"
                    : "white",
                }}
              >
                {mark.valuePreview}
                {/* always gonna have
                one key, because unwrapEntry is calle above */}
              </td>
              <td>
                <select
                  value={mark.classification}
                  onChange={(e) => {
                    mark.classification = e.target
                      .value as keyof typeof Classifications;
                    console.log("changed classification!");
                    refresh();
                  }}
                >
                  {[
                    ["history", "Historia przeglądania"],
                    ["id", "Sztucznie nadane id"],
                    ["location", "Lokalizacja"],
                  ].map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <EmailTemplate {...{ marks, clusters, version: counter }} />
      <HARConverter {...{ marks }} />
    </div>
  );
}

ReactDOM.render(<Report />, document.getElementById("app"));
