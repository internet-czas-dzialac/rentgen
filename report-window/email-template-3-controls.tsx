import React from 'react';
import { toBase64 } from '../util';
import { EmailTemplate3Config } from './email-template-3';

function setHostSetting<
    P1 extends keyof EmailTemplate3Config['hosts_settings'],
    P2 extends keyof EmailTemplate3Config['hosts_settings'][P1]
>(
    setConfig: React.Dispatch<React.SetStateAction<EmailTemplate3Config>>,
    [p1, p2]: [P1, P2],
    value: EmailTemplate3Config['hosts_settings'][P1][P2]
) {
    setConfig((v) => {
        console.log(v, {
            ...v,
            hosts_settings: {
                ...v.hosts_settings,
                [p1]: {
                    ...v.hosts_settings[p2],
                    [p2]: value,
                },
            },
        });
        return {
            ...v,
            hosts_settings: {
                ...v.hosts_settings,
                [p1]: {
                    ...v.hosts_settings[p1],
                    [p2]: value,
                },
            },
        };
    });
}

export default function EmailTemplate3Controls({
    config,
    setConfig,
}: {
    config: EmailTemplate3Config;
    setConfig: React.Dispatch<React.SetStateAction<EmailTemplate3Config>>;
}): JSX.Element {
    const p = config.pronoun;
    return (
        <div>
            <div>
                <label htmlFor="pronoun">Forma czasownika:</label>
                <select
                    id="pronoun"
                    value={config.pronoun}
                    onChange={(e) =>
                        setConfig((v) => ({
                            ...v,
                            pronoun: parseInt(e.target.value) as EmailTemplate3Config['pronoun'],
                        }))
                    }
                >
                    <option value="0">Wysłałem</option>
                    <option value="1">Wysłałam</option>
                    <option value="2">Wysłałom</option>
                    <option value="3">Wysłaliśmy</option>
                </select>
            </div>

            <div>
                <label htmlFor="policy_readable">
                    Czy polityka prywatności jest dostępna i czytelna?
                </label>
                <select
                    id="policy_readable"
                    value={config.policy_readable}
                    onChange={(e) =>
                        setConfig((v) => ({
                            ...v,
                            policy_readable: e.target
                                .value as EmailTemplate3Config['policy_readable'],
                        }))
                    }
                >
                    <option value="null" disabled>
                        wybierz opcję
                    </option>
                    <option value="yes">dostępna i czytelna</option>
                    <option value="entirely_obscured_by_popup">
                        dostępna, ale nieczytelna. Zasłania ją popup o RODO
                    </option>
                    <option value="cant_find">
                        Niedostępna. {['Szukałem', 'Szukałam', 'Szukałom', 'Szukaliśmy'][p]}, ale
                        nie {['znalazłem', 'znalazłam', 'znalazłom', 'znaleźliśmy'][p]} jej na
                        stronie
                    </option>
                </select>
            </div>
            {config.policy_readable !== 'null' ? (
                <div>
                    {Object.entries(config.hosts_settings).map(([id, settings]) => (
                        <div key={id}>
                            <h5>{id}</h5>
                            <p>
                                Cele przetwarzania danych przez właściciela domeny {id}{' '}
                                <select
                                    value={settings.presence}
                                    onChange={(e) =>
                                        setHostSetting(
                                            setConfig,
                                            [id, 'presence'],
                                            e.target
                                                .value as EmailTemplate3Config['hosts_settings'][string]['presence']
                                        )
                                    }
                                >
                                    <option value="null" disabled>
                                        wybierz opcję
                                    </option>
                                    <option value="not_mentioned">
                                        nie są nigdzie na stronie opisane{' '}
                                    </option>
                                    <option
                                        value="mentioned_in_policy"
                                        disabled={config.policy_readable !== 'yes'}
                                    >
                                        są opisane w polityce prywatności{' '}
                                    </option>
                                    <option value="mentioned_in_popup">
                                        są opisane w okienku RODO{' '}
                                    </option>
                                </select>
                            </p>
                            {!['not_mentioned', 'null'].includes(settings.presence) ? (
                                <p>
                                    Wskazana przez administratora podstawa prawna dla{' '}
                                    <strong> tego konkretnego celu</strong>{' '}
                                    <select
                                        value={settings.legal_basis_type}
                                        onChange={(e) =>
                                            setHostSetting(
                                                setConfig,
                                                [id, 'legal_basis_type'],
                                                e.target
                                                    .value as EmailTemplate3Config['hosts_settings'][string]['legal_basis_type']
                                            )
                                        }
                                    >
                                        <option value="null" disabled>
                                            wybierz opcję
                                        </option>
                                        <option value="consent">to zgoda.</option>
                                        <option value="legitimate_interest">
                                            to uzasadniony interes.
                                        </option>
                                        <option value="not_mentioned">
                                            nie jest wskazana nigdzie na stronie.
                                        </option>
                                    </select>
                                </p>
                            ) : (
                                ''
                            )}
                            {!['not_mentioned', 'null'].includes(settings.legal_basis_type) ? (
                                <div>dodatkowe pytania</div>
                            ) : (
                                ''
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                ''
            )}
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
            {config.popup_type === 'consent' ? (
                <div>
                    <label htmlFor="acceptAllName">
                        Tekst na przycisku do zatwierdzania wszystkich zgód:
                    </label>
                    <input
                        {...{
                            type: 'text',
                            value: config.popup_accept_all_text,
                            onChange: (e) =>
                                setConfig((v) => ({
                                    ...v,
                                    popup_accept_all_text: e.target.value,
                                })),
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
