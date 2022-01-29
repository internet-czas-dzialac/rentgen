import React from 'react';
import ReactDOM from 'react-dom';
import Options from '../options';
import { StolenData } from './stolen-data';
import { useEmitter } from '../util';
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
    try {
        const [origin, setOrigin] = React.useState<string | null>(null);
        const [minValueLength, setMinValueLength] = React.useState<
            number | null
        >(
            localStorage.getItem('minValueLength') === null
                ? 7
                : (localStorage.getItem('minValueLength') as unknown as number)
        );
        const [cookiesOnly, setCookiesOnly] = React.useState<boolean>(false);
        const [stolenDataView, setStolenDataView] =
            React.useState<boolean>(true);
        const [cookiesOrOriginOnly, setCookiesOrOriginOnly] =
            React.useState<boolean>(false);
        const [counter, setCounter] = useEmitter(getMemory());
        const [marksOccurrence, setMarksOccurrence] =
            React.useState<boolean>(false);
        const [warningDataDialogAck, setWarningDataDialogAck] =
            React.useState<boolean>(
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

        React.useEffect(() => {
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
                        logoVisibility
                            ? 'header'
                            : 'header header--without-logo'
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
                            <>
                                <span>Analiza strony</span>
                                <span className="webpage-metadata--hyperlink">
                                    {origin}
                                </span>
                            </>
                        ) : (
                            <span>Przejdź do wybranej strony internetowej</span>
                        )}
                    </div>
                    {stolenDataView ? (
                        <a href="https://internet-czas-dzialac.pl">
                            <img
                                src="/assets/icons/info_circle_outline.svg"
                                width="20"
                                height="20"
                            />
                        </a>
                    ) : (
                        <button onClick={() => setStolenDataView(true)}>
                            <img
                                src="/assets/icons/short_left.svg"
                                width="20"
                                height="20"
                            />
                        </button>
                    )}
                </header>

                {stolenDataView ? (
                    <nav>
                        <button
                            onClick={() => setStolenDataView(!stolenDataView)}
                        >
                            <img
                                src="/assets/icons/settings.svg"
                                width="20"
                                height="20"
                            />
                            <span>Ustawienia</span>
                        </button>
                        <button
                            onClick={() => {
                                getMemory().removeRequestsFor(origin);
                                setCounter((c) => c + 1);
                                setMarksOccurrence(false);
                            }}
                        >
                            <img
                                src="/assets/icons/trash_full.svg"
                                width="20"
                                height="20"
                            />
                            <span>Wyczyść historię wtyczki</span>
                        </button>
                        <button
                            onClick={() => {
                                getMemory().removeCookiesFor(origin);
                                setCounter((c) => c + 1);
                                setMarksOccurrence(false);
                            }}
                        >
                            <img
                                src="/assets/icons/cookie.svg"
                                width="20"
                                height="20"
                            />
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
                            <img
                                src="/assets/icons/mail.svg"
                                width="20"
                                height="20"
                            />
                            <span>
                                Utwórz wiadomość dla administratora witryny
                            </span>
                        </button>
                    </nav>
                ) : null}

                <section>
                    {stolenDataView ? (
                        <>
                            {warningDataDialogAck ? (
                                <section className="warning-container">
                                    <span>
                                        <strong>Uwaga!</strong> Niekoniecznie
                                        każda przechwycona poniżej informacja
                                        jest daną osobową. Niektóre z podanych
                                        domen mogą należeć do właściciela strony
                                        i nie reprezentować podmiotów trzecich.
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
                                        <img
                                            src="/assets/icons/close_big.svg"
                                            width="16"
                                            height="16"
                                        />
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
    } catch (e) {
        console.error(e);
    }
};
debugger;
ReactDOM.render(<Sidebar />, document.getElementById('app'));
