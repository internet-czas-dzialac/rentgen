import React from "react";
import memory from "./memory";
import { Sources } from "./request-cluster";
import { hyphenate, isJSONObject, isURL, parseToObject } from "./util";

function StolenDataValueTable({
  object,
  prefixKey = "",
}: {
  object: Record<string, unknown>;
  prefixKey: string;
}) {
  return (
    <table>
      <tbody>
        {Object.entries(object).map(([key, value]) => (
          <tr key={`${prefixKey}.${key}`}>
            <th>{hyphenate(key)}</th>
            <td>
              <StolenDataValue
                value={value}
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
  value,
  prefixKey = "",
}: {
  value: unknown;
  prefixKey?: string;
}) {
  if (!value) {
    return <></>;
  }
  console.log("parsing value!", value);
  if (isJSONObject(value)) {
    const object = parseToObject(value);
    return <StolenDataValueTable object={object} prefixKey={prefixKey} />;
  } else if (isURL(value)) {
    const url = new URL(value);
    const object = {
      host: url.host,
      path: url.pathname,
      ...Object.fromEntries(
        (
          url.searchParams as unknown as {
            entries: () => Iterable<[string, string]>;
          }
        ).entries()
      ),
    };
    return <StolenDataValueTable object={object} prefixKey={prefixKey} />;
  } else {
    return <>{value.toString()}</>;
  }
}

export default function StolenDataRow({
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
  const cluster = memory.getClustersForOrigin(origin)[shorthost];
  const icons: Record<Sources, string> = {
    cookie: "🍪",
    pathname: "🛣",
    queryparams: "🅿",
    header: "H",
  };
  return (
    <div>
      <h2>
        {cluster.id} {cluster.hasCookies() ? "🍪" : ""} x
        {cluster.requests.length}{" "}
        <a
          href="#"
          style={{ fontSize: "10px" }}
          onClick={() => memory.removeCookiesFor(origin, shorthost)}
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
                  <StolenDataValue value={entry.getValues()[0]} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
