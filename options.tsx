import React from 'react';
import './options.scss';

export default function Options({
    minValueLength,
    setMinValueLength,
    cookiesOnly,
    setCookiesOnly,
    cookiesOrOriginOnly,
    setCookiesOrOriginOnly,
    readWarningDataDialog,
    setReadWarningDataDialog,
    logoVisibility,
    setLogoVisibility,
}: {
    minValueLength: number;
    setMinValueLength: (n: number) => void;
    cookiesOnly: boolean;
    setCookiesOnly: (b: boolean) => void;
    cookiesOrOriginOnly: boolean;
    setCookiesOrOriginOnly: (b: boolean) => void;
    readWarningDataDialog: string;
    setReadWarningDataDialog: (s: string) => void;
    logoVisibility: string;
    setLogoVisibility: (s: string) => void;
}) {
    return (
        <div className="options-container">
            <span>Ustawienia interfejsu</span>
            <fieldset>
                <div className="input-container">
                    <input
                        type="checkbox"
                        id="readWarningDataDialog"
                        checked={readWarningDataDialog != '1'}
                        onChange={(e) => {
                            setReadWarningDataDialog(
                                e.target.checked ? '0' : '1'
                            );
                            localStorage.setItem(
                                'readWarningDataDialog',
                                e.target.checked ? '0' : '1'
                            );
                        }}
                    />
                    <label
                        className="label-checkbox"
                        htmlFor="readWarningDataDialog"
                    >
                        Wyświetlaj komunikat o pozyskiwanych danych
                    </label>
                </div>
                <div className="input-container">
                    <input
                        type="checkbox"
                        id="logoVisibility"
                        checked={logoVisibility != '0'}
                        onChange={(e) => {
                            setLogoVisibility(e.target.checked ? '1' : '0');
                            localStorage.setItem(
                                'logoVisibility',
                                e.target.checked ? '1' : '0'
                            );
                        }}
                    />
                    <label className="label-checkbox" htmlFor="logoVisibility">
                        Wyświetlaj logo <i>Internet. Czas działać!</i>
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
                        value={minValueLength}
                        onChange={(e) =>
                            setMinValueLength(parseInt(e.target.value))
                        }
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
                        onChange={(e) =>
                            setCookiesOrOriginOnly(e.target.checked)
                        }
                    />
                    <label
                        className="label-checkbox"
                        htmlFor="cookiesOrOriginOnly"
                    >
                        Pokazuj tylko dane z cookiesów lub z częścią historii
                        przeglądania
                    </label>
                </div>
            </fieldset>
        </div>
    );
}
