import React from "react";
import { RequestCluster } from "../request-cluster";
import { Classifications, Sources } from "../stolen-data-entry";

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

export default function DomainSummary({
  cluster,
}: {
  cluster: RequestCluster;
}) {
  return (
    <li>
      Właściciel domeny <strong>{cluster.id}</strong> otrzymał:{" "}
      <ul>
        <li>Mój adres IP</li>
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
