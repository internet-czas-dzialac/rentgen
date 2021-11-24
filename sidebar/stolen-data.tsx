import React from "react";
import { RequestCluster } from "../request-cluster";

import StolenDataCluster from "./stolen-data-cluster";
import { getshorthost } from "../util";
import { getMemory } from "../memory";

export function StolenData({
  origin,
  minValueLength,
  refreshToken,
  refresh,
  cookiesOnly,
  cookiesOrOriginOnly,
}: {
  origin: string;
  refreshToken: number;
  refresh: () => void;
  minValueLength: number;
  cookiesOnly: boolean;
  cookiesOrOriginOnly: boolean;
}) {
  if (!origin) {
    return <div></div>;
  }
  const clusters = Object.values(getMemory().getClustersForOrigin(origin))
    .sort(RequestCluster.sortCompare)
    .filter((cluster) => !cookiesOnly || cluster.hasCookies())
    .filter(
      (cluster) =>
        !cookiesOrOriginOnly || cluster.hasCookies() || cluster.exposesOrigin()
    );
  return (
    <div style={{ padding: "5px" }}>
      {" "}
      <div>
        <h1>
          {origin}
          <button
            style={{ marginLeft: "1rem" }}
            onClick={() =>
              getMemory().removeCookiesFor(
                origin,
                getshorthost(new URL(origin).host)
              )
            }
          >
            Wyczyść cookiesy 1st party
          </button>
          <button
            style={{ marginLeft: "1rem" }}
            onClick={() => {
              getMemory().removeRequestsFor(origin);
              refresh();
            }}
          >
            Wyczyść pamięć
          </button>
          <button
            onClick={() => clusters.forEach((cluster) => cluster.autoMark())}
          >
            Zaznacz automatycznie
          </button>
          <button
            style={{ marginLeft: "1rem" }}
            onClick={() =>
              window.open(
                `/report-window/report-window.html?origin=${origin}`,
                "new_window",
                "width=800,height=600"
              )
            }
          >
            Generuj maila
          </button>
        </h1>
        {clusters.map((cluster) => {
          return (
            <StolenDataCluster
              origin={origin}
              shorthost={cluster.id}
              key={cluster.id + origin}
              refreshToken={refreshToken}
              minValueLength={minValueLength}
              cookiesOnly={cookiesOnly}
              cookiesOrOriginOnly={cookiesOrOriginOnly}
            />
          );
        })}
      </div>
    </div>
  );
}
