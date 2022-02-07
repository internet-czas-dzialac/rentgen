import React from 'react';
import ReactDOM from 'react-dom';
import Options from '../options';
import { StolenData } from './stolen-data';
import { getshorthost, useEmitter } from '../util';
import { getMemory } from '../memory';

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
    const [origin, setOrigin] = React.useState<string | null>(null);
    const [minValueLength, setMinValueLength] = React.useState<number | null>(
        localStorage.getItem('minValueLength') === null
            ? 7
            : (localStorage.getItem('minValueLength') as unknown as number)
    );
    const [cookiesOnly, setCookiesOnly] = React.useState<boolean>(false);
    const [stolenDataView, setStolenDataView] = React.useState<boolean>(true);
    const [cookiesOrOriginOnly, setCookiesOrOriginOnly] = React.useState<boolean>(false);
    const [eventCounts, setEventCounts] = useEmitter(getMemory());
    const [marksOccurrence, setMarksOccurrence] = React.useState<boolean>(false);
    const [warningDataDialogAck, setWarningDataDialogAck] = React.useState<boolean>(
        localStorage.getItem('warningDataDialogAck') === null
            ? true
            : localStorage.getItem('warningDataDialogAck') == 'true'
            ? true
            : false
    );
    const [logoVisibility, setLogoVisibility] = React.useState<boolean>(
        localStorage.getItem('logoVisibility') === null
            ? false
            : localStorage.getItem('logoVisibility') == 'true'
            ? true
            : false
    );

    React.useEffect(() => {
        const listener = async () => {
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

    React.useEffect(() => {
        for (const cluster of Object.values(getMemory().getClustersForOrigin(origin))) {
            if (cluster.hasMarks()) {
                return setMarksOccurrence(true);
            }
        }
        return setMarksOccurrence(false);
    }, [eventCounts['*'], origin]);

    return (
        <div className="sidebar">
            <header className={logoVisibility ? 'header' : 'header header--without-logo'}>
                <img
                    src="../assets/logo-internet-czas-dzialac.svg"
                    height={40}
                    style={!logoVisibility ? { display: 'none' } : null}
                ></img>
                <div
                    className={
                        logoVisibility
                            ? 'webpage-metadata'
                            : 'webpage-metadata webpage-metadata--without-logo'
                    }
                >
                    {origin ? (
                        <>
                            <span>Analiza strony</span>
                            <span className="webpage-metadata--hyperlink">{origin}</span>
                        </>
                    ) : (
                        <span>Przejdź do wybranej strony internetowej</span>
                    )}
                </div>
                {stolenDataView ? (
                    <a href="https://internet-czas-dzialac.pl">
                        <img src="/assets/icons/info_circle_outline.svg" width="20" height="20" />
                    </a>
                ) : (
                    <button onClick={() => setStolenDataView(true)}>
                        <img src="/assets/icons/short_left.svg" width="20" height="20" />
                    </button>
                )}
            </header>

            {stolenDataView ? (
                <nav>
                    <button onClick={() => setStolenDataView(!stolenDataView)}>
                        <img src="/assets/icons/settings.svg" width="20" height="20" />
                        <span>Ustawienia</span>
                    </button>
                    <button
                        onClick={() => {
                            getMemory().removeRequestsFor(origin);
                            getMemory().emit('change', false, origin, 'clicked trash');
                            setMarksOccurrence(false);
                        }}
                    >
                        <img src="/assets/icons/trash_full.svg" width="20" height="20" />
                        <span>Wyczyść historię wtyczki</span>
                    </button>
                    <button
                        onClick={() => {
                            getMemory().removeCookiesFor(origin);
                            getMemory().emit('change', false, origin, 'clicked clear cookies');
                            setMarksOccurrence(false);
                        }}
                    >
                        <img src="/assets/icons/cookie.svg" width="20" height="20" />
                        <span>Wyczyść ciasteczka</span>
                    </button>
                    <button
                        disabled={!marksOccurrence}
                        title={
                            marksOccurrence
                                ? 'Kliknij, aby wygenerować wiadomość'
                                : 'Zaznacz poniżej elementy, aby móc wygenerować wiadomość'
                        }
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
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M20 20H4C2.89543 20 2 19.1046 2 18V5.913C2.04661 4.84255 2.92853 3.99899 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20ZM4 7.868V18H20V7.868L12 13.2L4 7.868ZM4.8 6L12 10.8L19.2 6H4.8Z"
                                fill="#2E3A59"
                            />
                        </svg>

                        <span>Utwórz wiadomość dla administratora witryny</span>
                    </button>
                </nav>
            ) : null}

            <section>
                {stolenDataView ? (
                    <>
                        {warningDataDialogAck ? (
                            <section className="warning-container">
                                <span>
                                    <strong>Uwaga!</strong> Niekoniecznie każda przechwycona poniżej
                                    informacja jest daną osobową. Niektóre z podanych domen mogą
                                    należeć do właściciela strony i nie reprezentować podmiotów
                                    trzecich.
                                </span>
                                <button
                                    onClick={() => {
                                        setWarningDataDialogAck(false);
                                        localStorage.setItem(
                                            'warningDataDialogAck',
                                            false as unknown as string
                                        );
                                    }}
                                >
                                    <img src="/assets/icons/close_big.svg" width="16" height="16" />
                                </button>
                            </section>
                        ) : null}
                        <StolenData
                            origin={origin}
                            eventCounts={eventCounts}
                            minValueLength={minValueLength}
                            cookiesOnly={cookiesOnly}
                            cookiesOrOriginOnly={cookiesOrOriginOnly}
                        />
                    </>
                ) : (
                    <Options
                        minValueLength={minValueLength}
                        setMinValueLength={setMinValueLength}
                        cookiesOnly={cookiesOnly}
                        setCookiesOnly={setCookiesOnly}
                        cookiesOrOriginOnly={cookiesOrOriginOnly}
                        setCookiesOrOriginOnly={setCookiesOrOriginOnly}
                        warningDataDialogAck={warningDataDialogAck}
                        setWarningDataDialogAck={setWarningDataDialogAck}
                        logoVisibility={logoVisibility}
                        setLogoVisibility={setLogoVisibility}
                    />
                )}
            </section>
        </div>
    );
};

ReactDOM.render(<Sidebar />, document.getElementById('app'));
