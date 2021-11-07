import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Options from "../options";
import { StolenData } from "./stolen-data";
import { useEmitter } from "../util";
import { getMemory } from "../memory";

async function getCurrentTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    windowId: browser.windows.WINDOW_ID_CURRENT,
  });
  return tab;
}

const Sidebar = () => {
  const [origin, setOrigin] = useState<string | null>(null);
  const [minValueLength, setMinValueLength] = useState<number | null>(7);
  const [cookiesOnly, setCookiesOnly] = useState<boolean>(false);
  const [counter, setCounter] = useEmitter(getMemory());

  useEffect(() => {
    const listener = async (data) => {
      console.log("tab change!");
      const tab = await getCurrentTab();
      const url = new URL(tab.url);
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
        refresh={() => setCounter((c) => c + 1)}
        minValueLength={minValueLength}
        cookiesOnly={cookiesOnly}
      />
    </>
  );
};

ReactDOM.render(<Sidebar />, document.getElementById("app"));
