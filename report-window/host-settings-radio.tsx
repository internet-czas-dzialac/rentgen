import { normalizeForClassname } from '../util';
import { EmailTemplate3Config } from './email-template-3';

export default function hostSettingsRadio<
    Field extends keyof EmailTemplate3Config['hosts_settings'][string]
>({
    options,
    host_id,
    field,
    setConfig,
    value,
}: {
    host_id: string;
    setConfig: React.Dispatch<React.SetStateAction<EmailTemplate3Config>>;
    field: Field;
    options: Record<Exclude<EmailTemplate3Config['hosts_settings'][string][Field], 'null'>, string>;
    value: EmailTemplate3Config['hosts_settings'][string][Field];
}) {
    return (
        <div>
            {Object.entries(options).map(([option_value, display]) => (
                <div>
                    <input
                        type="radio"
                        name={normalizeForClassname(host_id + '_consent_problems')}
                        value={option_value}
                        checked={value == option_value}
                        id={normalizeForClassname(option_value + host_id)}
                        onChange={(e) => {
                            setConfig((v) => ({
                                ...v,
                                hosts_settings: {
                                    ...v.hosts_settings,
                                    [host_id]: {
                                        ...v.hosts_settings[host_id],
                                        [field]: e.target.value,
                                    },
                                },
                            }));
                        }}
                    />
                    <label htmlFor={normalizeForClassname(option_value + host_id)}>{display}</label>
                </div>
            ))}
        </div>
    );
}
