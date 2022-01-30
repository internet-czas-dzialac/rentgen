import { setHostSetting } from './email-host-settings';
import { EmailTemplate3Config } from './email-template-3';

export default function hostSettingsDropdown<
    Field extends keyof EmailTemplate3Config['hosts_settings'][string]
>({
    host_id,
    setConfig,
    value,
    field,
    options,
}: {
    host_id: string;
    setConfig: React.Dispatch<React.SetStateAction<EmailTemplate3Config>>;
    settings: EmailTemplate3Config['hosts_settings'][string];
    field: Field;
    value: string;
    options: Record<
        Exclude<EmailTemplate3Config['hosts_settings'][string][Field], 'null'>,
        [string, boolean?]
    >;
}) {
    return (
        <select
            value={value}
            onChange={(e) =>
                setHostSetting(
                    setConfig,
                    [host_id, field],
                    e.target.value as EmailTemplate3Config['hosts_settings'][string][typeof field]
                )
            }
        >
            <option value="null" disabled>
                wybierz opcję
            </option>
            {Object.entries(options).map(
                ([value, [display, disabled]]: [string, [string, boolean]]) => (
                    <option value={value} disabled={disabled}>
                        {display}
                    </option>
                )
            )}
        </select>
    );
}
