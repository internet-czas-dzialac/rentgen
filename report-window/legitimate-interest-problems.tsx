import React from 'react';
import { setHostSetting } from './email-host-settings';
import { EmailTemplate3Config } from './email-template-3';
import hostSettingsDropdown from './host-setting-dropdown';

export default function LegitimateInteresProblems({
    settings,
    host_id,
    pronoun,
    setConfig,
}: {
    host_id: string;
    settings: EmailTemplate3Config['hosts_settings'][string];
    setConfig: React.Dispatch<React.SetStateAction<EmailTemplate3Config>>;
}) {
    if (settings.legal_basis_type !== 'legitimate_interest') {
        return '';
    }
    const [description, setDescription] = React.useState('marketing');
    return (
        <div>
            <div>
                Czy administrator strony opisał szczegółowo, na czym polega uzasadniony interes w
                kontekście tego celu?
                {hostSettingsDropdown({
                    settings,
                    host_id,
                    setConfig,
                    field: 'legitimate_interest_activity_specified' as const,
                    value: settings.legitimate_interest_activity_specified,
                    options: {
                        precise: [
                            'Tak, wskazuje jasno na bieżące działania lub korzyści wynikające z takiego przetwarzania danych.',
                        ],
                        vague: ['Wskazuje tylko ogólnie, jak np. „marketing” czy „statystyki”.'],
                        no: ['Nie. Nie wiadomo, na czym ten uzasadniony interes polega.'],
                    },
                })}
            </div>
            {settings.legitimate_interest_activity_specified === 'vague' ? (
                <div>
                    Jak administrator opisał to, na czym polega uzasadniony interes w kontekście{' '}
                    {host_id}?{' '}
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <button
                        onClick={(e) =>
                            setHostSetting(
                                setConfig,
                                [host_id, 'legitimate_interest_activity_description'],
                                description
                            )
                        }
                    >
                        zatwierdź
                    </button>
                </div>
            ) : (
                ''
            )}
        </div>
    );
}
