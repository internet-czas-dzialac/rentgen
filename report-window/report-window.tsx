import React from "react";
import ReactDOM from "react-dom";
import { getMemory } from "../util";

function Report() {
  const origin = new URL(document.location.toString()).searchParams.get(
    "origin"
  );
  const clusters = getMemory().getClustersForOrigin(origin);
  const marked_entries = Object.values(clusters)
    .map((cluster) => cluster.getMarkedRequests())
    .reduce((a, b) => a.concat(b), [])
    .map((request) => request.getMarkedEntries())
    .reduce((a, b) => a.concat(b), []);
  return (
    <div>
      <h1>Generuj treść maila dla {origin}</h1>
      <table>
        <thead>
          <tr>
            <th>Adres docelowy</th>
            <th>Źródło danych</th>
            <th>Treść danych</th>
            <th> Klasyfikacja</th>
          </tr>
        </thead>
        <tbody>
          {marked_entries.map((entry) => (
            <tr>
              <td>{entry.request.shorthost}</td>
              <td>
                {entry.source}:{entry.name}
                {entry.markedKeys.join(",")}
              </td>
              <td>{entry.value}</td>
              <td>
                <select>
                  {[
                    ["history", "Historia przeglądania"],
                    ["id", "Sztucznie nadane id"],
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
    </div>
  );
}

ReactDOM.render(<Report />, document.getElementById("app"));