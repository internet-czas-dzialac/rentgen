import { EmailTemplate3Config } from './email-template-3';
/* import hostSettingsDropdown from './host-setting-dropdown'; */
/* import ConsentProblems from './consent-problems'; */
import LegitimateInteresProblems from './legitimate-interest-problems';
/* import { hostNeedsQuestions } from './host-needs-questions'; */

export function setHostSetting<
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

export default function emailHostSettings(
    config: EmailTemplate3Config,
    setConfig: React.Dispatch<React.SetStateAction<EmailTemplate3Config>>
) {
    if (config.policy_readable == 'null') {
        return '';
    }
    const p = config.pronoun;
    return (
        <aside>
            {Object.entries(config.hosts_settings).map(([host_id, settings]) => (
                <div key={host_id}>
                    <h5>{/* {host_id}, {hostNeedsQuestions(settings).toString()} */}</h5>
                    <p>
                        Cele przetwarzania danych przez właściciela domeny {host_id}{' '}
                        {/* {hostSettingsDropdown({
                            host_id,
                            setConfig,
                            settings,
                            field: 'presence',
                            value: settings.presence,
                            options: {
                                not_mentioned: ['nie są nigdzie na stronie opisane'],
                                mentioned_in_policy: [
                                    'są opisane w polityce prywatności',
                                    config.policy_readable !== 'yes',
                                ],
                                mentioned_in_popup: ['są opisane w okienku RODO'],
                            },
                        })} */}
                    </p>
                    {!['not_mentioned', 'null'].includes(settings.presence) ? (
                        <p>
                            Wskazana przez administratora podstawa prawna dla{' '}
                            <strong> tego konkretnego celu</strong>{' '}
                            {/* {hostSettingsDropdown({
                                host_id,
                                setConfig,
                                settings,
                                field: 'legal_basis_type' as const,
                                value: settings.legal_basis_type,
                                options: {
                                    consent: ['to zgoda.'],
                                    legitimate_interest: ['to uzasadniony interes.'],
                                    not_mentioned: ['nie jest wskazana nigdzie na stronie.'],
                                },
                            })} */}
                        </p>
                    ) : (
                        ''
                    )}
                    {!['not_mentioned', 'null'].includes(settings.legal_basis_type) ? (
                        <div>
                            {ConsentProblems({ settings, host_id, pronoun: p, setConfig })}
                            {LegitimateInteresProblems({
                                settings,
                                host_id,
                                setConfig,
                            })}
                        </div>
                    ) : (
                        ''
                    )}
                </div>
            ))}
        </aside>
    );
}
