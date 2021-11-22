import React from "react";
import { getMemory } from "../memory";
import { RequestCluster } from "../request-cluster";
import { Sources, StolenDataEntry } from "../stolen-data-entry";

import { useEmitter } from "../util";

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
        {entry.value.slice(0, MAX_STRING_VALUE_LENGTH)}{" "}
        {entry.value.length > MAX_STRING_VALUE_LENGTH ? "(...)" : ""}
      </div>
    );
  }
  return (
    <div
      onClick={(e) => {
        entry.toggleMark();
        e.stopPropagation();
      }}
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

function StolenDataRow({
  entry,
  cluster,
}: {
  entry: StolenDataEntry;
  cluster: RequestCluster;
}) {
  const [version] = useEmitter(entry);
  return (
    <tr
      data-key={origin + cluster.id + entry.getUniqueKey()}
      data-version={version}
    >
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
      <td>{[entry.source].map((source) => icons[source])}</td>
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
                  cluster,
                  key: entry.id,
                }}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
}
