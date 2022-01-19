import React, { Fragment, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Options from '../options';
import { StolenData } from './stolen-data';
import { getshorthost, useEmitter } from '../util';
import { getMemory } from '../memory';
import InfoCircleIcon from '../assets/icons/info_circle_outline.svg';
import SettingsIcon from '../assets/icons/settings.svg';
import TrashIcon from '../assets/icons/trash_full.svg';
import MailIcon from '../assets/icons/mail.svg';
import ShortLeftIcon from '../assets/icons/short_left.svg';

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
    const [marksOccurrence, setMarksOccurrence] = useState<boolean>(false);

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

    useEffect(() => {
        for (const cluster of Object.values(
            getMemory().getClustersForOrigin(origin)
        )) {
            if (cluster.hasMarks()) {
                return setMarksOccurrence(true);
            }
        }
        return setMarksOccurrence(false);
    }, [counter, origin]);


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
                {stolenDataView ? (
                    <a href="https://internet-czas-dzialac.pl">
                        <InfoCircleIcon />
                    </a>
                ) : (
                    <button onClick={() => setStolenDataView(true)}>
                        <ShortLeftIcon />
                    </button>
                )}
            </header>

            <nav>
                <button onClick={() => setStolenDataView(!stolenDataView)}>
                    {/* {stolenDataView ? 'Options' : 'Data'}
                     */}
                    <SettingsIcon />
                    <span>Ustawienia wtyczki</span>
                </button>
                {/* <button
                    onClick={() => {
                        getMemory().removeCookiesFor(
                            origin,
                            getshorthost(new URL(origin).host)
                        );
                        setMarksOccurrence(false);
                    }}
                >
                    <TrashIcon />
                    <span>Wyczyść ciasteczka first-party</span>
                </button> */}
                <button
                    onClick={() => {
                        getMemory().removeRequestsFor(origin);
                        setCounter((c) => c + 1);
                        setMarksOccurrence(false);
                    }}
                >
                    {/* {stolenDataView ? 'Options' : 'Data'}
                     */}
                    <TrashIcon />
                    <span>Wyczyść ciasteczka</span>
                </button>
                <button
                    disabled={!marksOccurrence}
                    onClick={() => {
                        const params = [
                            'height=' + screen.height,
                            'width=' + screen.width,
                            'fullscreen=yes',
                        ].join(',');
                        window.open(
                            `/report-window/report-window.html?origin=${origin}`,
                            'new_window',
                            params
                        );
                    }}
                >
                    <MailIcon />
                    <span>Utwórz wiadomość dla administratora tej witryny</span>
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

            <footer>Footer marks → {JSON.stringify(marksOccurrence)}</footer>
        </Fragment>
    );
};

ReactDOM.render(<Sidebar />, document.getElementById('app'));
