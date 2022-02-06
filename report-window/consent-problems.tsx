/* import { EmailTemplate3Config } from './email-template-3';
 * import hostSettingsRadio from './host-settings-radio';
 *
 * export default function ConsentProblems({
 *     settings,
 *     host_id,
 *     setConfig,
 *     pronoun,
 * }: {
 *     host_id: string;
 *     setConfig: React.Dispatch<React.SetStateAction<EmailTemplate3Config>>;
 *     settings: EmailTemplate3Config['hosts_settings'][string];
 *     pronoun: 0 | 1 | 2 | 3;
 * }) {
 *     if (settings.legal_basis_type !== 'consent') {
 *         return '';
 *     }
 *     const p = pronoun;
 *     return (
 *         <div>
 *             {hostSettingsRadio({
 *                 host_id,
 *                 setConfig,
 *                 field: 'consent_problems' as const,
 *                 value: settings.consent_problems,
 *                 options: {
 *                     claims_consent_but_sends_before_consent: `Strona wysłała
 *                     ${p == 3 ? 'nasze' : 'moje'} dane do ${host_id} zanim
 *                     ${['wyraziłem', 'wyraziłam', 'wyraziłom', 'wyraziliśmy'][p]} na to zgodę.`,
 *                     claims_consent_but_there_was_no_easy_refuse: `${
 *                         ['Kliknąłem', 'Kliknęłam', 'Kliknęłom', 'Kliknęliśmy'][p]
 *                     }
 *                     przycisk od wyrażania zgody, ale w okienku o zgodę nie było natychmiastowo
 *                     dostępnego przycisku do niewyrażenia zgody jednym kliknięciem.`,
 *                     none: 'Żadne z powyższych.',
 *                 },
 *             })}
 *         </div>
 *     );
 * } */
