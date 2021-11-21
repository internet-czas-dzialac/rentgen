import React from "react";
import { getMemory } from "../memory";
import { MergedStolenDataEntry, Sources } from "../stolen-data-entry";

import { hyphenate } from "../util";

const MAX_STRING_VALUE_LENGTH = 100;

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
        {Object.keys(entry.getParsedValues(prefixKey)[0]).map((key) => {
          const subkey = `${prefixKey}.${key}`;
          return (
            <tr key={`${prefixKey}.${key}`}>
              <th
                onClick={(e) => {
                  entry.toggleMark(subkey);
                  e.stopPropagation();
                }}
                style={{
                  border: entry.hasMark(subkey)
                    ? "2px solid red"
                    : "2px solid transparent",
                }}
              >
                {hyphenate(key)}
              </th>
              <td>
                <StolenDataValue entry={entry} prefixKey={subkey} />
              </td>
            </tr>
          );
        })}
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
    const content = entry.getParsedValues(prefixKey)[0] as string;
    body = (
      <div
        style={{
          border: entry.hasMark(prefixKey)
            ? "2px solid red"
            : "2px solid transparent",
        }}
      >
        {content.slice(0, MAX_STRING_VALUE_LENGTH)}{" "}
        {content.length > MAX_STRING_VALUE_LENGTH ? "(...)" : ""}
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

const icons: Record<Sources, string> = {
  cookie: "🍪",
  pathname: "🛣",
  queryparams: "🅿",
  header: "H",
};

export default function StolenDataCluster({
  origin,
  shorthost,
  minValueLength,
  cookiesOnly,
  cookiesOrOriginOnly,
}: {
  origin: string;
  shorthost: string;
  refreshToken: number;
  minValueLength: number;
  cookiesOnly: boolean;
  cookiesOrOriginOnly: boolean;
}) {
  const cluster = getMemory().getClustersForOrigin(origin)[shorthost];
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
      <div>
        {cluster.getFullHosts().map((host) => (
          <a href={`https://${host}`}>{host}, </a>
        ))}
      </div>
      <table>
        <tbody>
          {cluster
            .getStolenData({ minValueLength, cookiesOnly, cookiesOrOriginOnly })
            .map((entry) => (
              <tr
                key={origin + cluster.id + entry.getUniqueKey()}
                data-key={origin + cluster.id + entry.getUniqueKey()}
              >
                <th
                  style={{
                    width: "100px",
                    overflowWrap: "anywhere",
                    border: entry.hasMark("")
                      ? "2px solid red"
                      : "2px solid transparent",
                  }}
                  onClick={() => entry.toggleMark("")}
                >
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
