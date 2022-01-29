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
import CloseBigIcon from '../assets/icons/close_big.svg';
import CookiesIcon from '../assets/icons/cookie.svg';

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
    const [minValueLength, setMinValueLength] = useState<number | null>(
        localStorage.getItem('minValueLength') === null
            ? 7
            : (localStorage.getItem('minValueLength') as unknown as number)
    );
    const [cookiesOnly, setCookiesOnly] = useState<boolean>(false);
    const [stolenDataView, setStolenDataView] = useState<boolean>(true);
    const [cookiesOrOriginOnly, setCookiesOrOriginOnly] =
        useState<boolean>(false);
    const [counter, setCounter] = useEmitter(getMemory());
    const [marksOccurrence, setMarksOccurrence] = useState<boolean>(false);
    const [warningDataDialogAck, setWarningDataDialogAck] = useState<boolean>(
        localStorage.getItem('warningDataDialogAck') === null
            ? true
            : localStorage.getItem('warningDataDialogAck') == 'true'
            ? true
            : false
    );
    const [logoVisibility, setLogoVisibility] = useState<boolean>(
        localStorage.getItem('logoVisibility') === null
            ? false
            : localStorage.getItem('logoVisibility') == 'true'
            ? true
            : false
    );

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
        <div className="sidebar">
            <header
                className={
                    logoVisibility ? 'header' : 'header header--without-logo'
                }
            >
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
                        <Fragment>
                            <span>Analiza strony</span>
                            <span className="webpage-metadata--hyperlink">
                                {origin}
                            </span>
                        </Fragment>
                    ) : (
                        <span>Przejdź do wybranej strony internetowej</span>
                    )}
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

            {stolenDataView ? (
                <nav>
                    <button onClick={() => setStolenDataView(!stolenDataView)}>
                        <SettingsIcon width={20} height={20} />
                        <span>Ustawienia</span>
                    </button>
                    <button
                        onClick={() => {
                            getMemory().removeRequestsFor(origin);
                            setCounter((c) => c + 1);
                            setMarksOccurrence(false);
                        }}
                    >
                        <TrashIcon width={20} height={20} />
                        <span>Wyczyść historię wtyczki</span>
                    </button>
                    <button
                        onClick={() => {
                            getMemory().removeCookiesFor(origin);
                            setCounter((c) => c + 1);
                            setMarksOccurrence(false);
                        }}
                    >
                        <CookiesIcon width={20} height={20} />
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
                        <MailIcon width={20} height={20} />
                        <span>Utwórz wiadomość dla administratora witryny</span>
                    </button>
                </nav>
            ) : null}

            <section>
                {stolenDataView ? (
                    <Fragment>
                        {warningDataDialogAck ? (
                            <section className="warning-container">
                                <span>
                                    <strong>Uwaga!</strong> Niekoniecznie każda
                                    przechwycona poniżej informacja jest daną
                                    osobową. Niektóre z podanych domen mogą
                                    należeć do właściciela strony i nie
                                    reprezentować podmiotów trzecich.
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
                                    <CloseBigIcon width={16} height={16} />
                                </button>
                            </section>
                        ) : null}
                        <StolenData
                            origin={origin}
                            refreshToken={counter}
                            refresh={() => setCounter((c) => c + 1)}
                            minValueLength={minValueLength}
                            cookiesOnly={cookiesOnly}
                            cookiesOrOriginOnly={cookiesOrOriginOnly}
                        />
                    </Fragment>
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
