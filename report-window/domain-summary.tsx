import React from "react";
import { RequestCluster } from "../request-cluster";
import { Classifications, Sources } from "../stolen-data-entry";

const emailClassifications: Record<keyof typeof Classifications, string> = {
  id: "sztucznie nadane mi ID",
  history: "część mojej historii przeglądania",
  location: "informacje na temat mojej lokalizacji geograficznej",
};

const emailSources: Record<Sources, string> = {
  header: "w nagłówku HTTP",
  cookie: "z pliku Cookie",
  pathname: "jako części adresu URL",
  queryparams: "jako część adresu URL (query-params)",
};

const source_priority: Array<Sources> = [
  "cookie",
  "pathname",
  "queryparams",
  "header",
];

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
          .getMarks()
          .sort((markA, markB) => {
            if (markA.entry.value > markB.entry.value) {
              return -1;
            } else if (markA.entry.value > markB.entry.value) {
              return 1;
            } else {
              const indexA = source_priority.indexOf(markA.source);
              const indexB = source_priority.indexOf(markB.source);
              if (indexA < indexB) {
                return -1;
              } else if (indexA > indexB) {
                return 1;
              } else {
                return markA.name > markB.name ? -1 : 1;
              }
            }
          })
          .filter((_, index, array) => {
            if (index == 0) {
              return true;
            }
            if (array[index].valuePreview === array[index - 1].valuePreview) {
              return false;
            } else {
              return true;
            }
          })
          .map((mark) => (
            <li>
              {emailClassifications[mark.classification]}{" "}
              {emailSources[mark.source]} (nazwa: <code>{mark.name}</code>,{" "}
              {mark.key ? (
                <>
                  pozycja <code>{mark.key}</code>,
                </>
              ) : (
                ""
              )}
              wartość: <code>{mark.valuePreview}</code>)
            </li>
          ))}
      </ul>
    </li>
  );
}
