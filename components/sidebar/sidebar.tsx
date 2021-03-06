import React from 'react';
import ReactDOM from 'react-dom';

import { getMemory } from '../../memory';
import Options from '../../options';
import { useEmitter } from '../../util';
import './../../styles/global.scss';
import './sidebar.scss';
import { StolenData } from './stolen-data';

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
    const [eventCounts] = useEmitter(getMemory());
    const [_, setMarksOccurrence] = React.useState<boolean>(false);
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
        if (!origin) return;
        for (const cluster of Object.values(getMemory().getClustersForOrigin(origin))) {
            if (cluster.hasMarks()) {
                return setMarksOccurrence(true);
            }
        }

        return setMarksOccurrence(false);
    }, [eventCounts['*']]);

    if (!origin) return <div>B????d: Brak parametru "origin"</div>;
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
                        <span>Przejd?? do wybranej strony internetowej</span>
                    )}
                </div>
                <button
                    className="button button--report"
                    onClick={() => {
                        window.open(
                            `/components/report-window/report-window.html?origin=${origin}`,
                            'new_tab'
                        );
                    }}
                >
                    Generuj raport
                </button>
            </header>

            {stolenDataView ? (
                <nav>
                    <button
                        onClick={() => {
                            window.open(
                                `/components/report-window/report-window.html?origin=${origin}`,
                                'new_tab'
                            );
                        }}
                    >
                        <img src="/assets/icons/report.svg" width="20" height="20" />
                        <span>Generuj raport</span>
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
                            {detailsVisibility ? 'Ukryj szczeg????y' : 'Wy??wietlaj szczeg????y'}
                        </span>
                    </button>
                    <button onClick={() => setStolenDataView(!stolenDataView)}>
                        <img src="/assets/icons/settings.svg" width="20" height="20" />
                        <span>Ustawienia</span>
                    </button>

                    {localStorage.getItem('blottingBrowser') ===
                    'nikttakniesplamitwojejprzegl??darkijakspidersweb' ? (
                        <button
                            onClick={() => {
                                if (
                                    window.confirm(
                                        'Czy chcesz wczyta?? wszystkie domeny??w celu ???splamienia??? twojej przegl??darki? Uwaga przegl??darka mo??e zablokowa?? otwieranie nowych kart. (Ten krok jest opcjonalny)'
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
                            <span>Odwied?? wszystkie domeny</span>
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
                                    <strong>
                                        Rentgen automatycznie zaznacza wybrane domeny na podstawie
                                        zebranych danych.
                                    </strong>{' '}
                                    Mo??esz teraz przej???? do generowania raportu lub dokona?? korekty.
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
                                    <strong>Uwaga!</strong> Niekoniecznie ka??da przes??ana poni??ej
                                    informacja jest dan?? osobow??. Niekt??re z??podanych domen mog??
                                    nale??e?? do w??a??ciciela strony i??nie reprezentowa?? podmiot??w
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
                            minValueLength={minValueLength === null ? 7 : minValueLength}
                            cookiesOnly={cookiesOnly}
                            cookiesOrOriginOnly={cookiesOrOriginOnly}
                            detailsVisibility={detailsVisibility}
                        />
                    </>
                ) : (
                    <Options
                        minValueLength={minValueLength === null ? 7 : minValueLength}
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
                        removeCookies={() => {
                            getMemory().removeCookiesFor(origin);
                            getMemory().emit('change', origin);
                            setMarksOccurrence(false);
                        }}
                        removeRequests={() => {
                            getMemory().removeRequestsFor(origin);
                            getMemory().emit('change', origin);
                            setMarksOccurrence(false);
                        }}
                    />
                )}
            </section>
        </div>
    );
};

ReactDOM.render(<Sidebar />, document.getElementById('app'));
