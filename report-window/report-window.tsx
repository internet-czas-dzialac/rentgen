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
  const entries = Object.values(clusters)
    .map((cluster) => cluster.getRepresentativeStolenData())
    .reduce(reduceConcat, [])
    .filter((entry) => entry.isMarked);
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
          {entries.map((entry) => (
            <tr
              key={entry.id}
              style={{
                backgroundColor:
                  entry.classification == "id" ? "yellow" : "white",
              }}
            >
              <td>{entry.request.shorthost}</td>
              <td style={{ overflowWrap: "anywhere" }}>
                {entry.source}:{entry.name}
              </td>
              <td
                style={{
                  width: "400px",
                  overflowWrap: "anywhere",
                  backgroundColor: entry.isRelatedToID()
                    ? "#ffff0054"
                    : "white",
                }}
              >
                {entry.getValuePreview()}
                {/* always gonna have
                one key, because unwrapEntry is called above */}
              </td>
              <td>
                <select
                  value={entry.classification}
                  onChange={(e) => {
                    entry.classification = e.target
                      .value as keyof typeof Classifications;
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
      <EmailTemplate {...{ entries, clusters, version: counter }} />
      <HARConverter {...{ entries }} />
    </div>
  );
}

ReactDOM.render(<Report />, document.getElementById("app"));
