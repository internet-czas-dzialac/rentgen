import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { useEmitter } from '../../util';
import { getMemory } from '../../memory';

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
    const [stolenDataView, setStolenDataView] = React.useState<boolean>(true);
    const [eventCounts, setEventCounts] = useEmitter(getMemory());
    const [cookieDomainCopy, setCookieDomainCopy] = React.useState<string | null>(null);
    const [marksOccurrence, setMarksOccurrence] = React.useState<boolean>(false);
    const [exposedOriginDomainCopy, setExposedOriginDomainCopy] = React.useState<string | null>(
        null
    );

    React.useEffect(() => {
        const listener = async () => {
            const tab = await getCurrentTab();

            if (tab !== undefined) {
                const url = new URL(tab.url);
                if (url.origin.startsWith('moz-extension')) {
                    return;
                }
                setOrigin(url.origin);
            } else {
                console.warn('Out of the tab scope');
            }
        };

        browser.tabs.onUpdated.addListener(listener);
        listener();
        return () => {
            browser.tabs.onUpdated.removeListener(listener);
        };
    });

    React.useEffect(() => {
        const exposedOriginDomains = Object.values(getMemory().getClustersForOrigin(origin))
            .filter((cluster) => cluster.exposesOrigin())
            .map((cluster) => cluster.id);
        setExposedOriginDomainCopy('');
        const first_sentence = `Strona ${origin} wysłała informacje o części Twojej historii przeglądania do `;

        switch (exposedOriginDomains.length) {
            case 0:
                return null;
            case 1:
                return setExposedOriginDomainCopy(first_sentence + `${exposedOriginDomains[0]}.`);
            case 2:
                return setExposedOriginDomainCopy(
                    first_sentence + `${exposedOriginDomains[0]} oraz ${exposedOriginDomains[1]}.`
                );
            case 3:
                return setExposedOriginDomainCopy(
                    first_sentence +
                        `${exposedOriginDomains[0]}, ${exposedOriginDomains[1]} oraz ${exposedOriginDomains[2]}.`
                );
            default:
                return setExposedOriginDomainCopy(
                    first_sentence +
                        `${exposedOriginDomains[0]}, ${exposedOriginDomains[1]} (i ${
                            exposedOriginDomains.length - 2 < 2
                                ? 2
                                : exposedOriginDomains.length - 2
                        } innych).`
                );
        }
    }, [eventCounts['*'], origin]);

    React.useEffect(() => {
        const cookieDomains = Object.values(getMemory().getClustersForOrigin(origin))
            .filter((cluster) => cluster.hasCookies())
            .map((cluster) => cluster.id);
        setCookieDomainCopy('');
        const first_sentence = `Strona ${origin} dokonała zapisu i odczytu plików Cookie dla domen `;

        switch (cookieDomains.length) {
            case 0:
                return null;
            case 1:
                return setCookieDomainCopy(first_sentence + `${cookieDomains[0]}.`);
            case 2:
                return setCookieDomainCopy(
                    first_sentence + `${cookieDomains[0]} oraz ${cookieDomains[1]}.`
                );
            case 3:
                return setCookieDomainCopy(
                    first_sentence +
                        `${cookieDomains[0]}, ${cookieDomains[1]} oraz ${cookieDomains[2]}.`
                );
            default:
                return setCookieDomainCopy(
                    first_sentence +
                        `${cookieDomains[0]}, ${cookieDomains[1]} (i ${
                            cookieDomains.length - 2 < 2 ? 2 : cookieDomains.length - 2
                        } innych).`
                );
        }
    }, [eventCounts['*'], origin]);

    React.useEffect(() => {
        for (const cluster of Object.values(getMemory().getClustersForOrigin(origin))) {
            if (cluster.hasMarks()) {
                return setMarksOccurrence(true);
            }
        }

        return setMarksOccurrence(false);
    }, [eventCounts['*']]);

    function autoMark() {
        for (const cluster of Object.values(getMemory().getClustersForOrigin(origin))) {
            cluster.autoMark();
        }
        return setMarksOccurrence(true);
    }

    return (
        <div className="toolbar">
            <header className="header">
                <img src="../../assets/icon-addon.svg" height={32}></img>
                <div className="webpage-metadata">
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
                <div className="counters-wrapper">
                    <div className="counters">
                        <div className="counter counter--browser-history">
                            <img src="/assets/icons/warning.svg#color" width="24" height="24" />
                            <span data-event={`${eventCounts['*']}`}>
                                {
                                    Object.values(getMemory().getClustersForOrigin(origin)).filter(
                                        (cluster) => cluster.exposesOrigin()
                                    ).length
                                }
                            </span>
                        </div>
                        <div className="counter counter--cookies">
                            <img src="/assets/icons/cookie.svg#color" width="24" height="24" />
                            <span data-event={`${eventCounts['*']}`}>
                                {
                                    Object.values(getMemory().getClustersForOrigin(origin)).filter(
                                        (cluster) => cluster.hasCookies()
                                    ).length
                                }
                            </span>
                        </div>
                    </div>
                    <div className="big-counter" data-event={`${eventCounts['*']}`}>
                        {Object.values(getMemory().getClustersForOrigin(origin)).length}
                    </div>
                </div>
                <span className="notice">Liczba wykrytych domen podmiotów trzecich</span>
            </section>

            <section className="details">
                <p
                    data-event={`${eventCounts['*']}`}
                    title={Object.values(getMemory().getClustersForOrigin(origin))
                        .filter((cluster) => cluster.exposesOrigin())
                        .map((domain) => domain.id)
                        .join(', ')}
                >
                    {exposedOriginDomainCopy}
                </p>
                <p
                    data-event={`${eventCounts['*']}`}
                    title={Object.values(getMemory().getClustersForOrigin(origin))
                        .filter((cluster) => cluster.hasCookies())
                        .map((domain) => domain.id)
                        .join(', ')}
                >
                    {cookieDomainCopy}
                </p>
            </section>

            {exposedOriginDomainCopy !== null || cookieDomainCopy !== null ? (
                <Fragment>
                    <section className="about">
                        <p>
                            Takie przetwarzanie danych może być niezgodne z prawem. Kliknij
                            w przycisk „Generuj raport”, aby pomóc ustalić, czy ta strona nie
                            narusza RODO.
                        </p>
                    </section>
                    <section className="actions">
                        <button
                            className="button button--details"
                            onClick={() => {
                                const params = [
                                    'height=' + screen.height,
                                    'width=' + screen.width,
                                    'fullscreen=yes',
                                ].join(',');
                                autoMark();
                                window.open(
                                    `/components/sidebar/sidebar.html?origin=${origin}`,
                                    'new_window',
                                    params
                                );
                            }}
                        >
                            Pokaż szczegóły
                        </button>
                        <button
                            className="button button--report"
                            onClick={() => {
                                const params = [
                                    'height=' + screen.height,
                                    'width=' + screen.width,
                                    'fullscreen=yes',
                                ].join(',');
                                autoMark();
                                window.open(
                                    `/components/report-window/report-window.html?origin=${origin}`,
                                    'new_window',
                                    params
                                );
                            }}
                        >
                            Generuj raport
                        </button>
                    </section>
                </Fragment>
            ) : null}
        </div>
    );
};

ReactDOM.render(<Toolbar />, document.getElementById('toolbar'));
