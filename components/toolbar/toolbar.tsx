import React from 'react';
import ReactDOM from 'react-dom';
import { useEmitter } from '../../util';
import { getMemory } from '../../memory';
browser.browserAction.setBadgeBackgroundColor({ color: '#ffb900' });

async function getCurrentTab() {
    const [tab] = await browser.tabs.query({
        active: true,
        windowId: browser.windows.WINDOW_ID_CURRENT,
    });
    return tab;
}

import './../../styles/global.scss';
import './toolbar.scss';

const Toolbar = () => {
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
        listener();
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
        <div className="toolbar">
            <header className="header">
                <img src="../../assets/icon-addon.svg" height={32}></img>
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

            <section className="summary">
                <div>
                    <div className="counters">
                        <div className="counter counter--browser-history">12</div>
                        <div className="counter counter--cookies">21</div>
                    </div>
                    <div className="big-counter">33</div>
                </div>
                <p>Liczba wykrytych domen podmiotów trzecich</p>
            </section>

            <section className="details">
                <p>
                    Strona wp.pl wysłała informacje o części Twojej historii przeglądania do
                    facebook.com, adnsx.com (i 43 innych).
                </p>
                <p>
                    Dokonała też zapisu i odczytu plików Cookie dla domen doubleclick.google.net,
                    3dsio.com (i 59 innych).
                </p>
            </section>

            <section className="warning-container">
                <span>
                    <strong>Takie przetwarzanie danych może być niezgodne z prawem.</strong> Kliknij
                    w przycisk <i>Generuj raport</i>, aby pomóc ustalić, czy ta strona nie narusza
                    RODO.
                </span>
            </section>

            <section className="actions">
                <a href="">Pokaż szczegóły</a>
                <button>Generuj raport</button>
            </section>
        </div>
    );
};

ReactDOM.render(<Toolbar />, document.getElementById('toolbar'));
