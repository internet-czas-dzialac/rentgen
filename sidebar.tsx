import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import memory, { RequestCluster } from "./memory";
import { parseCookie, Tab, useEmitter } from "./util";

async function getTabByID(id: number) {
  const tabs = await browser.tabs.query({ currentWindow: true });
  return tabs.find((tab) => tab.id == id);
}

async function getCurrentTab() {
  console.log("getCurrentTab");
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
    console.log("useEffect!");
    browser.tabs.query({ currentWindow: true }).then(setTabs);
  }, []);
  return (
    <select
      id="tab_dropdown"
      value={pickedTab}
      onChange={async (e) => {
        console.log(e.target.value);
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
  refreshToken,
}: {
  tabID: number;
  shorthost: string;
  refreshToken: number;
}) => {
  const cluster = memory.getClustersForTab(tabID)[shorthost];
  console.log(
    "!!",
    cluster
      .getCookiesContent()
      .map(parseCookie)
      .map((o) => Object.entries(o))
      .reduce((a, b) => a.concat(b), [])
  );
  return (
    <div>
      <h2>
        {cluster.id} {cluster.hasCookies() ? "🍪" : ""} x
        {cluster.requests.length}
      </h2>
      <table>
        <tbody>
          {cluster
            .getCookiesContent()
            .map(parseCookie)
            .map((o) => Object.entries(o))
            .reduce((a, b) => a.concat(b), [])
            .map(([cookie_name, cookie_value]) => (
              <tr>
                <th style={{ maxWidth: "200px", wordWrap: "break-word" }}>
                  {cookie_name}
                </th>
                <td>{cookie_value}</td>
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
}: {
  pickedTab: number | null;
  refreshToken: number;
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
        <img src={tab.favIconUrl} width="20" height="20" /> {tab.title}
        {clusters.map((cluster) => (
          <StolenDataRow
            tabID={pickedTab}
            shorthost={cluster.id}
            key={cluster.id}
            refreshToken={refreshToken}
          />
        ))}
      </div>
    </div>
  );
};

const Sidebar = () => {
  console.log("rendering!");
  const [pickedTab, setPickedTab] = useState<number | null>(null);
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
      <StolenData pickedTab={pickedTab} refreshToken={counter} />
    </>
  );
};

ReactDOM.render(<Sidebar />, document.getElementById("app"));
