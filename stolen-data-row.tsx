import React from "react";
import memory from "./memory";
import { Sources } from "./request-cluster";

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
                <th style={{ maxWidth: "200px", wordWrap: "break-word" }}>
                  {entry.getNames().join(",")}
                </th>
                <td>{entry.getSources().map((source) => icons[source])}</td>
                <td style={{ wordWrap: "anywhere" as any }}>
                  {entry.getValues()[0]}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
