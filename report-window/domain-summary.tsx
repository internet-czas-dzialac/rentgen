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
          .sort((markA, markB) =>
            markA.entry.value > markB.entry.value ? -1 : 1
          )
          .map((mark) => (
            <li>
              {emailClassifications[mark.classification]}{" "}
              {emailSources[mark.source]} (nazwa: {mark.name},{" "}
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
