import React, { useState } from "react";
import ReactDOM from "react-dom";
import { getMemory } from "../memory";
import { RequestCluster } from "../request-cluster";
import { Classifications, Sources } from "../stolen-data-entry";
import { getDate } from "../util";

const emailClassifications: Record<keyof typeof Classifications, string> = {
  id: "sztucznie nadane mi ID",
  history: "część mojej historii przeglądania",
};

const emailSources: Record<Sources, string> = {
  header: "w nagłówku HTTP",
  cookie: "z pliku Cookie",
  pathname: "jako części adresu URL",
  queryparams: "jako część adresu URL (query-params)",
};

type PopupState = "not_clicked" | "clicked_but_invalid";

function DomainSummary({ cluster }: { cluster: RequestCluster }) {
  return (
    <li>
      Właściciel domeny {cluster.id} otrzymał:{" "}
      <ul>
        {cluster
          .getMarkedEntries()
          .sort((entryA, entryB) => (entryA.value > entryB.value ? -1 : 1))
          .reduce((acc, entry, index, arr) => {
            if (index === 0) {
              return [entry];
            }
            if (entry.value != arr[index - 1].value) {
              acc.push(entry);
            }
            return acc;
          }, [])
          .map((entry) => (
            <li>
              {emailClassifications[entry.classification]}{" "}
              {emailSources[entry.source]}
              &nbsp;(<code>{entry.name.trim()}</code>)
            </li>
          ))}
      </ul>
    </li>
  );
}

function Report() {
  const [popupState, setPopupState] = useState<PopupState>("not_clicked");
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
            <th>Klasyfikacja</th>
          </tr>
        </thead>
        <tbody>
          {marked_entries.map((entry) => (
            <tr
              style={{
                backgroundColor:
                  entry.classification == "id" ? "yellow" : "white",
              }}
            >
              <td>{entry.request.shorthost}</td>
              <td style={{ overflowWrap: "anywhere" }}>
                {entry.source}:{entry.name}
                {entry.markedKeys.join(",")}
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
                {entry.value}
              </td>
              <td>
                <select value={entry.classification}>
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
      <label htmlFor="popupState">Status okienka o rodo:</label>
      <select
        id="popupState"
        value={popupState}
        onChange={(e) => setPopupState(e.target.value as PopupState)}
      >
        <option value="not_clicked">Nic nie kliknięte</option>
        <option value="clicked_but_invalid">Kliknięte, ale nieważne</option>
      </select>
      <div>
        <p>
          Dzień dobry, w dniu {getDate()} odwiedziłem stronę{" "}
          {marked_entries[0].request.originalURL}. Strona ta wysłała moje dane
          osobowe do podmiotów trzecich - bez mojej zgody.{" "}
        </p>
        <ul>
          {Object.values(clusters)
            .filter((cluster) => cluster.hasMarks())
            .map((cluster) => (
              <DomainSummary cluster={cluster} />
            ))}
        </ul>
        {popupState === "not_clicked" ? (
          <p>
            Dane te zostały wysłane przez Państwa stronę zanim zdążyłem w ogóle
            przeczytać treść wyskakującego okienka ze zgodami.
          </p>
        ) : null}
      </div>
    </div>
  );
}

ReactDOM.render(<Report />, document.getElementById("app"));
