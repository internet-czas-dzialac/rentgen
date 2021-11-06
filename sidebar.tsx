import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import memory from "./memory";
import { RequestCluster, Sources } from "./request-cluster";
import { Tab, useEmitter } from "./util";

async function getTabByID(id: number) {
  const tabs = await browser.tabs.query({ currentWindow: true });
  return tabs.find((tab) => tab.id == id);
}

async function getCurrentTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT,
  });
  return tab.id;
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
  tabID,
  shorthost,
  minValueLength,
  cookiesOnly,
}: {
  tabID: number;
  shorthost: string;
  refreshToken: number;
  minValueLength: number;
  cookiesOnly: boolean;
}) => {
  const cluster = memory.getClustersForTab(tabID)[shorthost];
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
        {cluster.requests.length}
      </h2>
      <table>
        <tbody>
          {cluster
            .getStolenData({ minValueLength, cookiesOnly })
            .map((entry) => (
              <tr>
                <th style={{ maxWidth: "200px", wordWrap: "break-word" }}>
                  {entry.name}
                </th>
                <td>{icons[entry.source]}</td>
                <td style={{ wordWrap: "anywhere" as any }}>
                  {entry.value} {entry.isIAB ? "!!!!! IAB" : ""}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

const StolenData = ({
  pickedTab,
  refreshToken,
  minValueLength,
  cookiesOnly,
}: {
  pickedTab: number | null;
  refreshToken: number;
  minValueLength: number;
  cookiesOnly: boolean;
}) => {
  const [tab, setTab] = useState<Tab | null>(null);
  useEffect(() => {
    getTabByID(pickedTab).then(setTab);
  }, [pickedTab]);
  if (!pickedTab || !tab) {
    return <div></div>;
  }
  const clusters = Object.values(memory.getClustersForTab(pickedTab)).sort(
    RequestCluster.sortCompare
  );
  return (
    <div style={{ padding: "5px" }}>
      {" "}
      <div>
        <h1>
          <img src={tab.favIconUrl} width="20" height="20" /> {tab.title}
        </h1>
        {clusters
          .filter((cluster) => !cookiesOnly || cluster.hasCookies())
          .map((cluster) => (
            <StolenDataRow
              tabID={pickedTab}
              shorthost={cluster.id}
              key={cluster.id}
              refreshToken={refreshToken}
              minValueLength={minValueLength}
              cookiesOnly={cookiesOnly}
            />
          ))}
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
  const [pickedTab, setPickedTab] = useState<number | null>(null);
  const [minValueLength, setMinValueLength] = useState<number | null>(7);
  const [cookiesOnly, setCookiesOnly] = useState<boolean>(false);
  const counter = useEmitter(memory);
  return (
    <>
      <div id="selector">
        <TabDropdown setPickedTab={setPickedTab} pickedTab={pickedTab} />
        <button
          id="get_current_tab_button"
          onClick={async () => setPickedTab(await getCurrentTab())}
        >
          Wybierz aktywną kartę{" "}
        </button>
      </div>
      <Options
        minValueLength={minValueLength}
        setMinValueLength={setMinValueLength}
        cookiesOnly={cookiesOnly}
        setCookiesOnly={setCookiesOnly}
      />
      <StolenData
        pickedTab={pickedTab}
        refreshToken={counter}
        minValueLength={minValueLength}
        cookiesOnly={cookiesOnly}
      />
    </>
  );
};

ReactDOM.render(<Sidebar />, document.getElementById("app"));
