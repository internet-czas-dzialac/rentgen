import React from "react";
import memory from "../memory";
import { MergedStolenDataEntry, Sources } from "../request-cluster";
import { getMemory, hyphenate } from "../util";

function StolenDataValueTable({
  entry,
  prefixKey = "",
}: {
  entry: MergedStolenDataEntry;
  prefixKey: string;
}) {
  return (
    <table>
      <tbody>
        {Object.keys(entry.getParsedValues(prefixKey)[0]).map((key) => (
          <tr key={`${prefixKey}.${key}`}>
            <th
              onClick={(e) => {
                entry.toggleMark(prefixKey);
                e.stopPropagation();
              }}
            >
              {hyphenate(key)}
            </th>
            <td>
              <StolenDataValue
                entry={entry}
                prefixKey={`${prefixKey}.${key}`}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StolenDataValue({
  entry,
  prefixKey = "",
}: {
  entry: MergedStolenDataEntry;
  prefixKey?: string;
}) {
  const value = entry.getParsedValues(prefixKey)[0];
  let body = null;
  if (!value) {
    body = <></>;
  } else if (typeof value === "string") {
    body = (
      <div style={{ border: entry.hasMark(prefixKey) ? "2px solid red" : "" }}>
        {entry.getParsedValues(prefixKey)[0] as string}
      </div>
    );
  } else {
    body = <StolenDataValueTable entry={entry} prefixKey={prefixKey} />;
  }
  return (
    <div
      onClick={(e) => {
        entry.toggleMark(prefixKey);
        e.stopPropagation();
      }}
      data-marks={entry.getMarkedValues().join(", ")}
    >
      {body}
    </div>
  );
}

export default function StolenDataCluster({
  origin,
  shorthost,
  minValueLength,
  cookiesOnly,
}: {
  origin: string;
  shorthost: string;
  refreshToken: number;
  minValueLength: number;
  cookiesOnly: boolean;
}) {
  const cluster = getMemory().getClustersForOrigin(origin)[shorthost];
  const icons: Record<Sources, string> = {
    cookie: "🍪",
    pathname: "🛣",
    queryparams: "🅿",
    header: "H",
  };
  return (
    <div>
      <h2>
        <a href={"https://" + cluster.id}>{cluster.id}</a>{" "}
        {cluster.hasCookies() ? "🍪" : ""} x{cluster.requests.length}{" "}
        <a
          href="#"
          style={{ fontSize: "10px" }}
          onClick={() => getMemory().removeCookiesFor(origin, shorthost)}
        >
          Wyczyść cookiesy
        </a>
      </h2>
      <table>
        <tbody>
          {cluster
            .getStolenData({ minValueLength, cookiesOnly })
            .map((entry) => (
              <tr
                key={origin + cluster.id + entry.getUniqueKey()}
                data-key={origin + cluster.id + entry.getUniqueKey()}
              >
                <th style={{ width: "100px", overflowWrap: "anywhere" }}>
                  {entry.getNames().map(hyphenate).join(", ")}
                </th>
                <td>{entry.getSources().map((source) => icons[source])}</td>
                <td style={{ wordWrap: "anywhere" as any }}>
                  <StolenDataValue entry={entry} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
