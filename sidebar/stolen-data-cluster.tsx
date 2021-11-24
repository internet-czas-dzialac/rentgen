import React from "react";
import { getMemory } from "../memory";
import { StolenDataEntry } from "../stolen-data-entry";

import { maskString, useEmitter } from "../util";

const MAX_STRING_VALUE_LENGTH = 100;

function StolenDataValue({
  entry,
}: {
  entry: StolenDataEntry;
  prefixKey?: string;
}) {
  const [version] = useEmitter(entry);
  let body = null;
  if (!entry.value) {
    body = <></>;
  } else {
    body = (
      <div data-version={version}>
        {maskString(entry.value, 1, MAX_STRING_VALUE_LENGTH)}
      </div>
    );
  }
  return (
    <div
      onClick={(e) => {
        entry.toggleMark();
        e.stopPropagation();
      }}
      style={{ color: entry.isMarked ? "black" : "gray" }}
    >
      {body}
    </div>
  );
}

function StolenDataRow({ entry }: { entry: StolenDataEntry }) {
  const [version] = useEmitter(entry);
  return (
    <tr data-key={entry.id} data-version={version}>
      <td>
        <input
          type="checkbox"
          checked={entry.isMarked}
          onChange={() => entry.toggleMark()}
        />
      </td>
      <th
        style={{
          width: "100px",
          overflowWrap: "anywhere",
        }}
        onClick={() => entry.toggleMark()}
      >
        {entry.name}
      </th>
      <td style={{ whiteSpace: "nowrap" }}>
        {entry.source === "cookie" ? (
          <span title="Dane przechowywane w Cookies">🍪</span>
        ) : entry.request.hasCookie() ? (
          <span
            title="Wysłane w zapytaniu opatrzonym cookies"
            style={{ opacity: 0.5, fontSize: "0.5em" }}
          >
            🍪
          </span>
        ) : null}
        {entry.exposesOrigin() ? (
          <span title="Pokazuje część historii przeglądania">⚠️</span>
        ) : entry.request.exposesOrigin() ? (
          <span
            title="Jest częścią zapytania, które ujawnia historię przeglądania"
            style={{ opacity: 0.5, fontSize: "0.5em" }}
          >
            ⚠️
          </span>
        ) : null}
      </td>
      <td style={{ wordWrap: "anywhere" as any }}>
        <StolenDataValue entry={entry} />
      </td>
    </tr>
  );
}

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
            .getRepresentativeStolenData({
              minValueLength,
              cookiesOnly,
              cookiesOrOriginOnly,
            })
            .map((entry) => (
              <StolenDataRow
                {...{
                  entry,
                  key: entry.id,
                }}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
}
