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
