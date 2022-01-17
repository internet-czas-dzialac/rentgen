import React, { Fragment, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Options from '../options';
import { StolenData } from './stolen-data';
import { useEmitter } from '../util';
import { getMemory } from '../memory';
import InfoCircle from '../assets/icons/info_circle_outline.svg';

async function getCurrentTab() {
    const [tab] = await browser.tabs.query({
        active: true,
        windowId: browser.windows.WINDOW_ID_CURRENT,
    });
    return tab;
}

import './global.scss';
import './sidebar.scss';

const Sidebar = () => {
    const [origin, setOrigin] = useState<string | null>(null);
    const [minValueLength, setMinValueLength] = useState<number | null>(7);
    const [cookiesOnly, setCookiesOnly] = useState<boolean>(false);
    const [stolenDataView, setStolenDataView] = useState<boolean>(true);
    const [cookiesOrOriginOnly, setCookiesOrOriginOnly] =
        useState<boolean>(false);
    const [counter, setCounter] = useEmitter(getMemory());

    useEffect(() => {
        const listener = async (data: any) => {
            console.log('tab change!');
            const tab = await getCurrentTab();
            const url = new URL(tab.url);
            if (url.origin.startsWith('moz-extension')) {
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
        <Fragment>
            {/* <div id="selector">
        <TabDropdown setPickedTab={setPickedTab} pickedTab={pickedTab} />
        <button
          id="get_current_tab_button"
          onClick={async () => setPickedTab(await getCurrentTab())}
        >
          Wybierz aktywną kartę{" "}
        </button>
      </div> */}
            <header>
                <img
                    src="../assets/logo-internet-czas-dzialac.svg"
                    height={48}
                ></img>
                <div className="webpage-metadata">
                    <span>Analiza strony</span>
                    <span className="webpage-metadata--hyperlink">
                        {origin}
                    </span>
                </div>
                <a href="https://internet-czas-dzialac.pl">
                    <InfoCircle />
                </a>
            </header>

            <nav>
                <button onClick={() => setStolenDataView(!stolenDataView)}>
                    {stolenDataView ? 'Options' : 'Data'}
                </button>
            </nav>

            <section>
                {stolenDataView ? (
                    <StolenData
                        origin={origin}
                        refreshToken={counter}
                        refresh={() => setCounter((c) => c + 1)}
                        minValueLength={minValueLength}
                        cookiesOnly={cookiesOnly}
                        cookiesOrOriginOnly={cookiesOrOriginOnly}
                    />
                ) : (
                    <Options
                        minValueLength={minValueLength}
                        setMinValueLength={setMinValueLength}
                        cookiesOnly={cookiesOnly}
                        setCookiesOnly={setCookiesOnly}
                        cookiesOrOriginOnly={cookiesOrOriginOnly}
                        setCookiesOrOriginOnly={setCookiesOrOriginOnly}
                    />
                )}
            </section>

            <footer>Footer</footer>
        </Fragment>
    );
};

ReactDOM.render(<Sidebar />, document.getElementById('app'));
