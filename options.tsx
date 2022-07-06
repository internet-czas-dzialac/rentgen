import React, { Fragment } from 'react';
import './options.scss';

export default function Options({
    minValueLength,
    setMinValueLength,
    cookiesOnly,
    setCookiesOnly,
    cookiesOrOriginOnly,
    setCookiesOrOriginOnly,
    warningDataDialogAck,
    setWarningDataDialogAck,
    detailsVisibility,
    setDetailsVisibility,
    setStolenDataView,
}: {
    minValueLength: number;
    setMinValueLength: (n: number) => void;
    cookiesOnly: boolean;
    setCookiesOnly: (b: boolean) => void;
    cookiesOrOriginOnly: boolean;
    setCookiesOrOriginOnly: (b: boolean) => void;
    warningDataDialogAck: boolean;
    setWarningDataDialogAck: (b: boolean) => void;
    detailsVisibility: boolean;
    setDetailsVisibility: (b: boolean) => void;
    setStolenDataView: (b: boolean) => void;
}) {
    return (
        <Fragment>
            <nav>
                <button onClick={() => setStolenDataView(true)}>
                    <img src="/assets/icons/short_left.svg" width="20" height="20" />
                    <span>Wróć do szczegółów</span>
                </button>
            </nav>
            <div className="options-container">
                <span>Interfejs</span>
                <fieldset>
                    <div className="input-container">
                        <input
                            type="checkbox"
                            id="detailsVisibility"
                            checked={detailsVisibility}
                            onChange={(e) => {
                                setDetailsVisibility(e.target.checked);
                                localStorage.setItem(
                                    'detailsVisibility',
                                    e.target.checked as unknown as string
                                );
                            }}
                        />
                        <label className="label-checkbox" htmlFor="detailsVisibility">
                            Wyświetlaj szczegóły pozyskanych danych
                        </label>
                    </div>
                    <div className="input-container">
                        <input
                            type="checkbox"
                            id="warningDataDialogAck"
                            checked={warningDataDialogAck}
                            onChange={(e) => {
                                setWarningDataDialogAck(e.target.checked);
                                localStorage.setItem(
                                    'warningDataDialogAck',
                                    e.target.checked as unknown as string
                                );
                            }}
                        />
                        <label className="label-checkbox" htmlFor="warningDataDialogAck">
                            Wyświetlaj komunikat o pozyskiwanych danych
                        </label>
                    </div>
                </fieldset>
                <span>Ustawienia zaawansowane</span>
                <fieldset>
                    <div className="input-container">
                        <label htmlFor="minValueLength">
                            Pokazuj tylko wartości o długości co najmniej{' '}
                        </label>
                        <input
                            type="number"
                            id="minValueLength"
                            min={1}
                            value={minValueLength}
                            onChange={(e) => {
                                setMinValueLength(parseInt(e.target.value));
                                localStorage.setItem('minValueLength', e.target.value);
                            }}
                        />
                    </div>
                    <div className="input-container">
                        <input
                            type="checkbox"
                            id="cookiesOnly"
                            checked={cookiesOnly}
                            onChange={(e) => setCookiesOnly(e.target.checked)}
                        />
                        <label className="label-checkbox" htmlFor="cookiesOnly">
                            Pokazuj tylko dane z cookiesów
                        </label>
                    </div>
                    <div className="input-container">
                        <input
                            type="checkbox"
                            id="cookiesOrOriginOnly"
                            checked={cookiesOrOriginOnly}
                            onChange={(e) => setCookiesOrOriginOnly(e.target.checked)}
                        />
                        <label className="label-checkbox" htmlFor="cookiesOrOriginOnly">
                            Pokazuj tylko dane z cookiesów lub z częścią historii przeglądania
                        </label>
                    </div>
                </fieldset>
            </div>
        </Fragment>
    );
}
