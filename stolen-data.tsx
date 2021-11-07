import React from "react";
import memory from "./memory";
import { RequestCluster } from "./request-cluster";
import StolenDataRow from "./stolen-data-row";
import { getshorthost } from "./util";

export function StolenData({
  origin,
  minValueLength,
  refreshToken,
  cookiesOnly,
}: {
  origin: string;
  refreshToken: number;
  minValueLength: number;
  cookiesOnly: boolean;
}) {
  if (!origin) {
    return <div></div>;
  }
  const clusters = Object.values(memory.getClustersForOrigin(origin)).sort(
    RequestCluster.sortCompare
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
              memory.removeCookiesFor(
                origin,
                getshorthost(new URL(origin).host)
              )
            }
          >
            Wyczyść cookiesy 1st party
          </button>
          <button
            style={{ marginLeft: "1rem" }}
            onClick={() => memory.removeRequestsFor(origin)}
          >
            Wyczyść pamięć
          </button>
        </h1>
        {clusters
          .filter((cluster) => !cookiesOnly || cluster.hasCookies())
          .map((cluster) => {
            return (
              <StolenDataRow
                origin={origin}
                shorthost={cluster.id}
                key={cluster.id + origin}
                refreshToken={refreshToken}
                minValueLength={minValueLength}
                cookiesOnly={cookiesOnly}
              />
            );
          })}
      </div>
    </div>
  );
}
