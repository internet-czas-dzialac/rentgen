import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import memory from "./memory";
import { RequestCluster, Sources } from "./request-cluster";
import { getshorthost, useEmitter } from "./util";

async function getCurrentTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT,
  });
  return tab;
}

const TabDropdown = ({
  setPickedTab,
  pickedTab,
}: {
  setPickedTab: (tab_id: number) => void;
  pickedTab: number;
}) => {
  const [tabs, setTabs] = useState([]);
  useEffect(() => {
    browser.tabs.query({ currentWindow: true }).then(setTabs);
  }, []);
  return (
    <select
      id="tab_dropdown"
      value={pickedTab}
      onChange={async (e) => {
        setPickedTab(parseInt(e.target.value));
      }}
    >
      {tabs.map((tab) => (
        <option value={tab.id} key={tab.id}>
          {tab.title}
        </option>
      ))}
    </select>
  );
};

const StolenDataRow = ({
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
}) => {
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
          onClick={() => cluster.removeAllCookies()}
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
};

const StolenData = ({
  origin,
  minValueLength,
  refreshToken,
  cookiesOnly,
}: {
  origin: string;
  refreshToken: number;
  minValueLength: number;
  cookiesOnly: boolean;
}) => {
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
};

const Options = ({
  minValueLength,
  setMinValueLength,
  cookiesOnly,
  setCookiesOnly,
}) => {
  return (
    <fieldset>
      <h3>Zaawansowane ustawienia</h3>
      <label htmlFor="minValueLength">
        Pokazuj tylko wartości o długości co najmniej{" "}
      </label>
      <input
        type="number"
        id="minValueLength"
        value={minValueLength}
        onChange={(e) => setMinValueLength(parseInt(e.target.value))}
      />
      <br />
      <input
        type="checkbox"
        id="cookiesOnly"
        value={cookiesOnly}
        onChange={(e) => setCookiesOnly(e.target.checked)}
      />
      <label htmlFor="cookiesOnly">Pokazuj tylko dane z cookiesów</label>
    </fieldset>
  );
};

const Sidebar = () => {
  const [origin, setOrigin] = useState<string | null>(null);
  const [minValueLength, setMinValueLength] = useState<number | null>(7);
  const [cookiesOnly, setCookiesOnly] = useState<boolean>(false);
  const counter = useEmitter(memory);

  useEffect(() => {
    const listener = async (data) => {
      console.log("tab change!");
      const tab = await getCurrentTab();
      const url = new URL(tab.url);
      console.log(
        "NEW ORIGIN",
        url.origin,
        url.origin.startsWith("moz-extension")
      );
      if (url.origin.startsWith("moz-extension")) {
        return;
      }
      setOrigin(url.origin);
    };
    browser.tabs.onUpdated.addListener(listener);
    return () => {
      browser.tabs.onUpdated.removeListener(listener);
    };
  });

  return (
    <>
      {/* <div id="selector">
        <TabDropdown setPickedTab={setPickedTab} pickedTab={pickedTab} />
        <button
          id="get_current_tab_button"
          onClick={async () => setPickedTab(await getCurrentTab())}
        >
          Wybierz aktywną kartę{" "}
        </button>
      </div> */}
      <Options
        minValueLength={minValueLength}
        setMinValueLength={setMinValueLength}
        cookiesOnly={cookiesOnly}
        setCookiesOnly={setCookiesOnly}
      />
      <StolenData
        origin={origin}
        refreshToken={counter}
        minValueLength={minValueLength}
        cookiesOnly={cookiesOnly}
      />
    </>
  );
};

ReactDOM.render(<Sidebar />, document.getElementById("app"));
