import React from 'react';
import * as Survey from 'survey-react';
import { toBase64 } from '../util';
import emailHostSettings from './email-host-settings';
import { EmailTemplate3Config } from './email-template-3';
import verbs from './verbs';

var json = {
    showQuestionNumbers: 'off',
    pages: [
        {
            title: 'Zaimki',
            elements: [
                {
                    type: 'dropdown',
                    name: 'zaimek',
                    title: 'Forma czasownika:',
                    isRequired: true,
                    choices: [
                        { value: 0, text: 'Wysłałem' },
                        { value: 1, text: 'Wysłałam' },
                        { value: 2, text: 'Wysłałom' },
                        { value: 3, text: 'Wysłaliśmy' },
                    ],
                },
            ],
        },
        {
            title: 'Polityka prywatności',
            elements: [
                {
                    type: 'dropdown',
                    title: 'Czy polityka prywatności jest dostępna i czytelna?',
                    isRequired: true,
                    choices: [
                        { value: 'yes', text: 'dostępna i czytelna' },
                        {
                            value: 'entirely_obscured_by_popup',
                            text: 'dostępna, ale nieczytelna. Zasłania ją popup o RODO',
                        },
                        {
                            value: 'cant_find',
                            text: `Niedostępna. {Szukałem}, ale nie {znalazłem} jej na stronie`,
                        },
                    ],
                },
            ],
        },
    ],
};

const survey = new Survey.Model(json);
survey.onProcessTextValue.add(function (
    sender: Survey.SurveyModel,
    options: { name: string; value?: string }
) {
    if (verbs[options.name.toLowerCase()]) {
        options.value = verbs[options.name.toLowerCase()][sender.valuesHash.zaimek];
        if (options.name[0] == options.name[0].toUpperCase()) {
            options.value = [options.value[0].toUpperCase(), ...options.value.slice(1)].join('');
        }
    }
});

export default function EmailTemplate3Controls() {
    return <Survey.Survey model={survey} />;
}

export function _EmailTemplate3Controls({
    config,
    setConfig,
}: {
    config: EmailTemplate3Config;
    setConfig: React.Dispatch<React.SetStateAction<EmailTemplate3Config>>;
}): JSX.Element {
    return (
        <div>
            {emailHostSettings(config, setConfig)}
            <div>
                <label htmlFor="poup_type">Typ okienka o RODO: </label>
                <select
                    id="poup_type"
                    value={config.popup_type}
                    onChange={(e) =>
                        setConfig((v) => ({
                            ...v,
                            popup_type: e.target.value as EmailTemplate3Config['popup_type'],
                        }))
                    }
                >
                    <option value="none">Brak jakiejkolwiek informacji</option>
                    <option value="passive_cookie_banner">
                        Pasywne powiadomienie o cookiesach
                    </option>
                    <option value="consent">Okienko z pytaniem o zgodę</option>
                </select>
            </div>
            {config.popup_type !== 'none' ? (
                <div>
                    <label htmlFor="popup_screenshot">Zrzut ekranu okienka o RODO:</label>
                    <input
                        {...{
                            type: 'file',
                            id: 'popup_screenshot',
                            onChange: async (e) => {
                                const popup_screenshot_base64 = await toBase64(e.target.files[0]);
                                setConfig((v) => ({
                                    ...v,
                                    popup_screenshot_base64,
                                }));
                            },
                        }}
                    />
                </div>
            ) : (
                ''
            )}
            <div>
                <label htmlFor="popup_action">Czy coś klikn*ł*m w informacjach o RODO?</label>
                <select
                    id="popup_action"
                    value={config.popup_type}
                    onChange={(e) =>
                        setConfig((v) => ({
                            ...v,
                            popup_action: e.target.value as EmailTemplate3Config['popup_action'],
                        }))
                    }
                >
                    <option value="ignored">Nic nie klin*ł*m</option>
                    <option value="accepted">Kliknięte „{config.popup_accept_all_text}”</option>
                    <option value="closed">Zamkn*ł*m okienko (np. przyciskiem "X")</option>
                </select>
            </div>
            {config.popup_action === 'closed' ? (
                <div>
                    <label htmlFor="popup_closed_how">Jak okienko zostało zamknięte? Poprzez</label>
                    <input
                        id="popup_closed_how"
                        type="text"
                        placeholder="kliknięcie przycisku „X”"
                        value={config.popup_closed_how}
                        style={{ width: '300px' }}
                        onChange={(e) =>
                            setConfig((v) => ({
                                ...v,
                                popup_closed_how: e.target.value,
                            }))
                        }
                    />
                </div>
            ) : (
                ''
            )}
            {config.popup_type !== 'none' ? (
                <div>
                    <input
                        type="checkbox"
                        id="popup_mentions_passive_consent"
                        checked={config.popup_mentions_passive_consent}
                        onChange={(e) =>
                            setConfig((v) => ({
                                ...v,
                                popup_mentions_passive_consent: e.target.checked,
                            }))
                        }
                    />
                    <label htmlFor="popup_mentions_passive_consent">
                        okienko wspomina o pasywnej zgodzie (np. „korzystając ze strony wyrażasz
                        zgodę”)
                    </label>
                </div>
            ) : (
                ''
            )}
            {config.popup_mentions_passive_consent ? (
                <div>
                    <label htmlFor="popup_passive_consent_text">
                        Jak okienko próbuje wmówić Ci, że wyrażasz zgodę? Przeklej z treści okienka:
                    </label>
                    <input
                        id="popup_passive_consent_text"
                        placeholder="Korzystając ze strony wyrażasz zgodę"
                        value={config.popup_passive_consent_text}
                        onChange={(e) =>
                            setConfig((v) => ({
                                ...v,
                                popup_passive_consent_text: e.target.value,
                            }))
                        }
                    />
                </div>
            ) : (
                ''
            )}
        </div>
    );
}
