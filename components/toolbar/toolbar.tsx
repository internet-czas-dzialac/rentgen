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
    const [eventCounts] = useEmitter(getMemory());
    const [cookieDomainCopy, setCookieDomainCopy] = React.useState<string | null>(null);
    const [_, setMarksOccurrence] = React.useState<boolean>(false);
    const [exposedOriginDomainCopy, setExposedOriginDomainCopy] = React.useState<string | null>(
        null
    );

    const first_sentence_cookie = 'Strona dokonała zapisu i odczytu plików Cookie dla domen ';
    const first_sentence_history =
        'Część informacji o Twojej historii przeglądania została wysłana do ';

    React.useEffect(() => {
        const listener = async () => {
            const tab = await getCurrentTab();

            if (tab !== undefined && tab.url) {
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
        if (!origin) return;
        const exposedOriginDomains = Object.values(getMemory().getClustersForOrigin(origin))
            .filter((cluster) => cluster.exposesOrigin())
            .map((cluster) => cluster.id);
        setExposedOriginDomainCopy('');

        switch (exposedOriginDomains.length) {
            case 0:
                break;
            case 1:
                setExposedOriginDomainCopy(`${exposedOriginDomains[0]}.`);
                break;
            case 2:
                setExposedOriginDomainCopy(
                    `${exposedOriginDomains[0]} oraz ${exposedOriginDomains[1]}.`
                );
                break;
            case 3:
                setExposedOriginDomainCopy(
                    `${exposedOriginDomains[0]}, ${exposedOriginDomains[1]} oraz ${exposedOriginDomains[2]}.`
                );
                break;
            default:
                setExposedOriginDomainCopy(
                    `${exposedOriginDomains[0]}, ${exposedOriginDomains[1]} (i ${
                        exposedOriginDomains.length - 2 < 2 ? 2 : exposedOriginDomains.length - 2
                    } innych).`
                );
                break;
        }
    }, [eventCounts['*'], origin]);

    React.useEffect(() => {
        if (!origin) return;
        const cookieDomains = Object.values(getMemory().getClustersForOrigin(origin))
            .filter((cluster) => cluster.hasCookies())
            .map((cluster) => cluster.id);
        setCookieDomainCopy('');

        switch (cookieDomains.length) {
            case 0:
                break;
            case 1:
                setCookieDomainCopy(`${cookieDomains[0]}.`);
                break;
            case 2:
                setCookieDomainCopy(`${cookieDomains[0]} oraz ${cookieDomains[1]}.`);
                break;
            case 3:
                setCookieDomainCopy(
                    `${cookieDomains[0]}, ${cookieDomains[1]} oraz ${cookieDomains[2]}.`
                );
                break;
            default:
                setCookieDomainCopy(
                    `${cookieDomains[0]}, ${cookieDomains[1]} (i ${
                        cookieDomains.length - 2 < 2 ? 2 : cookieDomains.length - 2
                    } innych).`
                );
                break;
        }
    }, [eventCounts['*'], origin]);

    React.useEffect(() => {
        if (!origin) return;
        for (const cluster of Object.values(getMemory().getClustersForOrigin(origin))) {
            if (cluster.hasMarks()) {
                return setMarksOccurrence(true);
            }
        }

        return setMarksOccurrence(false);
    }, [eventCounts['*']]);

    function autoMark() {
        if (!origin) return;
        for (const cluster of Object.values(getMemory().getClustersForOrigin(origin))) {
            cluster.autoMark();
        }
        return setMarksOccurrence(true);
    }

    return (
        <div className="toolbar">
            <header className={origin ? 'header' : 'header header--no-page'}>
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
                {origin ? (
                    <a href="https://internet-czas-dzialac.pl">
                        <img src="/assets/icons/info_circle_outline.svg" width="20" height="20" />
                    </a>
                ) : null}
            </header>

            {origin ? (
                <Fragment>
                    {' '}
                    <section className="summary">
                        <div className="counters-wrapper">
                            <div className="counters">
                                <div className="counter counter--cookies">
                                    <img
                                        src="/assets/icons/cookie.svg#color"
                                        width="24"
                                        height="24"
                                    />
                                    <span data-event={`${eventCounts['*']}`}>
                                        {
                                            Object.values(
                                                getMemory().getClustersForOrigin(origin)
                                            ).filter((cluster) => cluster.hasCookies()).length
                                        }
                                    </span>
                                </div>
                                <div className="counter counter--browser-history">
                                    <img
                                        src="/assets/icons/warning.svg#color"
                                        width="24"
                                        height="24"
                                    />
                                    <span data-event={`${eventCounts['*']}`}>
                                        {
                                            Object.values(
                                                getMemory().getClustersForOrigin(origin)
                                            ).filter((cluster) => cluster.exposesOrigin()).length
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
                        {cookieDomainCopy ? (
                            <p
                                data-event={`${eventCounts['*']}`}
                                title={Object.values(getMemory().getClustersForOrigin(origin))
                                    .filter((cluster) => cluster.hasCookies())
                                    .map((domain) => domain.id)
                                    .join(', ')}
                            >
                                {first_sentence_cookie}
                                <strong>{cookieDomainCopy}</strong>
                            </p>
                        ) : null}
                        {exposedOriginDomainCopy ? (
                            <p
                                data-event={`${eventCounts['*']}`}
                                title={Object.values(getMemory().getClustersForOrigin(origin))
                                    .filter((cluster) => cluster.exposesOrigin())
                                    .map((domain) => domain.id)
                                    .join(', ')}
                            >
                                {first_sentence_history}
                                <strong>{exposedOriginDomainCopy}</strong>
                            </p>
                        ) : null}
                    </section>
                    {exposedOriginDomainCopy || cookieDomainCopy ? (
                        <Fragment>
                            <section className="about">
                                <p>
                                    Takie przetwarzanie danych może być niezgodne z prawem. Przejdź
                                    do analizy aby pomóc ustalić, czy ta strona nie narusza RODO lub
                                    ustawy Prawo Telekomunikacyjne.
                                </p>
                            </section>
                            <section className="actions">
                                <button
                                    className="button button--report"
                                    onClick={() => {
                                        autoMark();
                                        window.open(
                                            `/components/sidebar/sidebar.html?origin=${origin}`,
                                            'new_tab'
                                        );
                                        window.close(); // close toolbar popup
                                    }}
                                >
                                    Przejdź do analizy
                                </button>
                            </section>
                        </Fragment>
                    ) : (
                        <Fragment>
                            <section className="about about__no-errors">
                                <p>Nie znaleziono problemów na tej stronie.</p>
                            </section>
                        </Fragment>
                    )}
                </Fragment>
            ) : null}
        </div>
    );
};

ReactDOM.render(<Toolbar />, document.getElementById('toolbar'));
