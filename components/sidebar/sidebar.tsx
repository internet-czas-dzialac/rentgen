import React from 'react';
import ReactDOM from 'react-dom';
import Options from '../../options';
import { StolenData } from './stolen-data';
import { getshorthost, useEmitter } from '../../util';
import { getMemory } from '../../memory';

async function getCurrentTab() {
    const [tab] = await browser.tabs.query({
        active: true,
        windowId: browser.windows.WINDOW_ID_CURRENT,
    });
    return tab;
}

import './../../styles/global.scss';
import './sidebar.scss';

const Sidebar = () => {
    const url = new URL(document.location.toString());
    const origin = url.searchParams.get('origin');

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
    const [infoDataDialogAck, setInfoDataDialogAck] = React.useState<boolean>(
        localStorage.getItem('infoDataDialogAck') === null
            ? true
            : localStorage.getItem('infoDataDialogAck') == 'true'
            ? true
            : false
    );
    const [warningDataDialogAck, setWarningDataDialogAck] = React.useState<boolean>(
        localStorage.getItem('warningDataDialogAck') === null
            ? true
            : localStorage.getItem('warningDataDialogAck') == 'true'
            ? true
            : false
    );
    const [detailsVisibility, setDetailsVisibility] = React.useState<boolean>(
        localStorage.getItem('detailsVisibility') === null
            ? false
            : localStorage.getItem('detailsVisibility') == 'true'
            ? true
            : false
    );

    React.useEffect(() => {
        for (const cluster of Object.values(getMemory().getClustersForOrigin(origin))) {
            if (cluster.hasMarks()) {
                return setMarksOccurrence(true);
            }
        }

        return setMarksOccurrence(false);
    }, [eventCounts['*']]);

    return (
        <div className="sidebar">
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
                <button
                    className="button button--report"
                    onClick={() => {
                        const params = [
                            'height=' + screen.height,
                            'width=' + screen.width,
                            'fullscreen=yes',
                        ].join(',');
                        window.open(
                            `/components/report-window/report-window.html?origin=${origin}`,
                            'new_window',
                            params
                        );
                    }}
                >
                    Generuj raport
                </button>
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
                            getMemory().emit('change', origin);
                            setMarksOccurrence(false);
                        }}
                    >
                        <img src="/assets/icons/trash_full.svg" width="20" height="20" />
                        <span>Wyczyść historię wtyczki</span>
                    </button>
                    <button
                        onClick={() => {
                            getMemory().removeCookiesFor(origin);
                            getMemory().emit('change', origin);
                            setMarksOccurrence(false);
                        }}
                    >
                        <img src="/assets/icons/cookie.svg" width="20" height="20" />
                        <span>Wyczyść ciasteczka</span>
                    </button>
                    <button
                        onClick={() => {
                            setDetailsVisibility(!detailsVisibility);
                        }}
                    >
                        <img
                            src={
                                detailsVisibility
                                    ? '/assets/icons/file_minus.svg'
                                    : '/assets/icons/file_find.svg'
                            }
                            width="20"
                            height="20"
                        />

                        <span>
                            {detailsVisibility ? 'Ukryj szczegóły' : 'Wyświetlaj szczegóły'}
                        </span>
                    </button>
                    {localStorage.getItem('blottingBrowser') ===
                    'nikttakniesplamitwojejprzeglądarkijakspidersweb' ? (
                        <button
                            onClick={() => {
                                if (
                                    window.confirm(
                                        'Czy chcesz wczytać wszystkie domeny w celu „splamienia” twojej przeglądarki? Uwaga przeglądarka może zablokować otwieranie nowych kart. (Ten krok jest opcjonalny)'
                                    )
                                ) {
                                    let deep_copy = JSON.parse(
                                        JSON.stringify(
                                            Object.values(
                                                getMemory().getClustersForOrigin(origin)
                                            ).map((domain) => domain.id)
                                        )
                                    );
                                    for (const domain of deep_copy) {
                                        window.open(`https://${domain}`);
                                    }
                                }
                            }}
                        >
                            <img src="/assets/icons/bulb.svg" width="20" height="20" />
                            <span>Odwiedź wszystkie domeny</span>
                        </button>
                    ) : null}
                </nav>
            ) : null}

            <section>
                {stolenDataView ? (
                    <>
                        {infoDataDialogAck ? (
                            <section className="dialog-container dialog-container--info">
                                <span>
                                    <strong>Uwaga!</strong> Wtyczka Rentgen automatycznie zaznacza
                                    wybrane domeny, możesz teraz przejść do generowania raportu lub
                                    dokonać korekty.
                                </span>
                                <button
                                    onClick={() => {
                                        setInfoDataDialogAck(false);
                                        localStorage.setItem(
                                            'infoDataDialogAck',
                                            false as unknown as string
                                        );
                                    }}
                                >
                                    <img src="/assets/icons/close_big.svg" width="16" height="16" />
                                </button>
                            </section>
                        ) : null}
                        {warningDataDialogAck ? (
                            <section className="dialog-container dialog-container--warning">
                                <span>
                                    <strong>Uwaga!</strong> Niekoniecznie każda przechwycona poniżej
                                    informacja jest daną osobową. Niektóre z podanych domen mogą
                                    należeć do właściciela strony i nie reprezentować podmiotów
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
                            detailsVisibility={detailsVisibility}
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
                        detailsVisibility={detailsVisibility}
                        setDetailsVisibility={setDetailsVisibility}
                        setStolenDataView={setStolenDataView}
                    />
                )}
            </section>
        </div>
    );
};

ReactDOM.render(<Sidebar />, document.getElementById('app'));
