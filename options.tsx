import React from 'react';
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
    logoVisibility,
    setLogoVisibility,
}: {
    minValueLength: number;
    setMinValueLength: (n: number) => void;
    cookiesOnly: boolean;
    setCookiesOnly: (b: boolean) => void;
    cookiesOrOriginOnly: boolean;
    setCookiesOrOriginOnly: (b: boolean) => void;
    warningDataDialogAck: boolean;
    setWarningDataDialogAck: (b: boolean) => void;
    logoVisibility: boolean;
    setLogoVisibility: (b: boolean) => void;
}) {
    return (
        <div className="options-container">
            <span>Interfejs</span>
            <fieldset>
                <div className="input-container">
                    <input
                        type="checkbox"
                        id="logoVisibility"
                        checked={logoVisibility}
                        onChange={(e) => {
                            setLogoVisibility(e.target.checked);
                            localStorage.setItem(
                                'logoVisibility',
                                e.target.checked as unknown as string
                            );
                        }}
                    />
                    <label className="label-checkbox" htmlFor="logoVisibility">
                        Wyświetlaj logo <i>Internet. Czas działać!</i>
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
                    <label
                        className="label-checkbox"
                        htmlFor="warningDataDialogAck"
                    >
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
