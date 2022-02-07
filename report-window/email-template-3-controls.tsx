import React from 'react';
import * as Survey from 'survey-react';
import { toBase64 } from '../util';
import emailHostSettings from './email-host-settings';
import { EmailTemplate3Config } from './email-template-3';
import verbs from './verbs';

function generateHostPage(
    host: string,
    index: number,
    all_hosts: string[]
): { title: string; elements: any[] } {
    function f(name: string, h = host) {
        return `${h.replace(/\./g, '_')}|${name}`;
    }
    const previous_host: string | null = index > 0 ? all_hosts[index - 1] : null;
    function defaultValue(name: string) {
        if (!previous_host) {
            return {};
        }
        return { defaultValueExpression: `{${f(name, previous_host)}}` };
    }
    return {
        title: host,
        elements: [
            {
                type: 'dropdown',
                name: f('present'),
                isRequired: true,
                title: `Cel ujawnienia danych właścicielowi domeny ${host}`,
                ...defaultValue('present'),
                choices: [
                    { value: 'not_mentioned', text: 'nie jest podany nigdzie na stronie' },
                    {
                        value: 'mentioned_in_policy',
                        text: 'jest podany w polityce prywatności',
                        visibleIf: "{policy_readable} = 'yes' ",
                    },

                    { value: 'mentioned_in_popup', text: 'jest podany w okienku RODO' },
                ],
            },
            {
                type: 'dropdown',
                name: f('legal_basis_type'),
                ...defaultValue('legal_basis_type'),
                isRequired: true,
                title: `Podstawa prawna dla tego konkretnego celu`,
                visibleIf: `{${f('present')}} notempty and {${f('present')}} != "not_mentioned"`,
                choices: [
                    { value: 'consent', text: 'to zgoda.' },
                    {
                        value: 'legitimate_interest',
                        text: 'to uzasadniony interes.',
                    },
                    { value: 'not_mentioned', text: 'nie jest wskazana nigdzie na stronie.' },
                ],
            },
            {
                type: 'radiogroup',
                name: f('consent_problems'),
                ...defaultValue('consent_problems'),
                isRequired: true,
                title: `Jak ma się ta podstawa prawna do stanu faktycznego?`,
                visibleIf: `{${f('legal_basis_type')}} = "consent"`,
                choices: [
                    {
                        value: 'claims_consent_but_sends_before_consent',
                        text: `Strona wysłała {moje} dane do ${host} zanim {wyraziłem} na to zgodę`,
                    },
                    {
                        value: 'claims_consent_but_there_was_no_easy_refuse',
                        text: '{Kliknąłem} przycisk od wyrażania zgody, ale w okienku o zgodę nie było natychmiastowo dostępnego przycisku do niewyrażenia zgody jednym kliknięciem',
                    },
                    { value: 'none', text: 'żadne z powyższych.' },
                ],
            },
            {
                type: 'dropdown',
                name: f('legitimate_interest_activity_specified'),
                ...defaultValue('legitimate_interest_activity_specified'),
                isRequired: true,
                title: /* HTML */ `Czy administrator strony opisał szczegółowo, na czym polega
                uzasadniony interes w kontekście tego celu?`,
                visibleIf: `{${f('legal_basis_type')}} = "legitimate_interest"`,
                choices: [
                    {
                        value: 'precise',
                        text: /* HTML */ `Tak, wskazuje jasno na bieżące działania lub korzyści
                        wynikające z takiego przetwarzania danych.`,
                    },
                    {
                        value: 'vague',
                        text: `Wskazuje tylko ogólnie, jak np. „marketing” czy „statystyki”.`,
                    },
                    {
                        value: 'no',
                        text: `Nie. Nie wiadomo, na czym ten uzasadniony interes polega.`,
                    },
                ],
            },
            {
                type: 'text',
                title: `Jak administrator opisał to, na czym polega uzasadniony interes w kontekście ${host}?`,
                name: f('legitimate_interest_description'),
                visibleIf: `{${f('legitimate_interest_activity_specified')}} = 'vague'`,
                defaultValueExpression:
                    index == 0
                        ? 'marketing'
                        : `{${f('legitimate_interest_description', previous_host)}}`,
            },
            {
                type: 'dropdown',
                title: `Czy domena ${host} należy do podmiotu spoza Europy (np. Google, Facebook)?`,
                name: f('outside_eu'),
                ...defaultValue('outside_eu'),
                visibleIf: `{${f('legitimate_interest_activity_specified')}} = "precise" or {${f(
                    'consent_problems'
                )}} = "none"`,
                choices: [
                    { value: 'yes', text: 'Tak' },
                    { value: 'no', text: 'Nie' },
                    { value: 'not_sure', text: 'Nie wiem' },
                ],
            },
        ],
    };
}

export default function EmailTemplate3Controls({ hosts }: { hosts: string[] }) {
    const [survey, setSurvey] = React.useState<Survey.Model>(null);
    React.useEffect(() => {
        var json = {
            showQuestionNumbers: 'off',
            showProgressBar: 'top',
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
                    title: 'Obowiązek informacyjny i machanizm pozyskiwania zgody',
                    elements: [
                        {
                            type: 'radiogroup',
                            title: 'Jaką formę informacji o przetwarzaniu danych osobowych stosuje ta strona?',
                            name: 'popup_type',
                            isRequired: true,
                            choices: [
                                { value: 'none', text: 'Brak informacji' },
                                {
                                    value: 'passive_popup',
                                    text: /* HTML */ `Okienko o cookiesach, bez możliwości podjęcia
                                    żadnego wyboru (np. tylko opcja „zamknij”)`,
                                },
                                {
                                    value: 'some_choice',
                                    text: 'Okienko o cookiesach, z możliwością podjęcia wyboru',
                                },
                            ],
                        },
                        {
                            type: 'checkbox',
                            title: /* HTML */ `Istnieje możliwość, że okienko z informacjami i
                            wyborami dotyczącymi przetwarzania {Twoich} danych osobowych ukazało się
                            dawno temu w trakcie {twojej} wcześniejszej wizyty i wtedy je
                            {odkliknąłeś}. {Otwórz} tę samą stronę w Trybie Prywatnym (Incognito).
                            Co {widzisz}?`,
                            visibleIf: "{popup_type} = 'none'",
                            name: 'is_incognito_different',
                            isRequired: true,
                            choices: [
                                {
                                    value: 'incognito_is_the_same',
                                    text: 'W Trybie prywatnym {widzę} to samo, co {widziałem} w normalnym trybie',
                                },
                            ],
                        },
                        {
                            type: 'html',
                            visibleIf: '{is_incognito_different} != "no" and {popup_type} = "none"',
                            html: /* HTML */ `Jeżeli w trybie incognito widzisz więcej okienek z
                                informacjami o przetwarzaniu danych osobowych, wykonaj analizę w
                                normalnym trybie ponownie - ale najpierw usuń pliki cookies tej
                                strony.
                                <a
                                    href="https://support.mozilla.org/pl/kb/usuwanie-ciasteczek-i-danych-stron-firefox?redirectslug=usuwanie-ciasteczek&redirectlocale=pl"
                                    target="_blank"
                                >
                                    Zobacz, jak to zrobić
                                </a>`,
                        },
                        {
                            type: 'radiogroup',
                            name: 'mentions_passive_consent',
                            isRequired: true,
                            visibleIf: '{popup_type} = "passive_popup"',
                            title: 'Czy treść okienka wskazuje na zgodę wyrażoną pasywnie, np. „Korzystając z naszej strony wyrażasz zgodę” lub „Brak zmiany ustawień przeglądarki oznacza zgodę”?',
                            choices: [
                                {
                                    value: 'yes',
                                    text: 'Tak',
                                },
                                {
                                    value: 'no',
                                    text: 'Nie',
                                },
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
                            name: 'policy_readable',
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
                ...hosts.map(generateHostPage),
            ],
        };

        console.log(json);

        const survey = new Survey.Model(json);
        survey.onProcessTextValue.add(function (
            sender: Survey.SurveyModel,
            options: { name: string; value?: string }
        ) {
            if (verbs[options.name.toLowerCase()]) {
                options.value = verbs[options.name.toLowerCase()][sender.valuesHash.zaimek];
                if (options.name[0] == options.name[0].toUpperCase()) {
                    options.value = [
                        options.value[0].toUpperCase(),
                        ...options.value.slice(1),
                    ].join('');
                }
            }
        });
        setSurvey(survey);
    }, []);

    if (!survey) {
        return <div>Wczytywanie...</div>;
    }

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
