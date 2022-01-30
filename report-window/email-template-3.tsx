import React from 'react';
import { RequestCluster } from '../request-cluster';
import { StolenDataEntry } from '../stolen-data-entry';
import { getDate } from '../util';
import EmailTemplate3Controls from './email-template-3-controls';

declare var PLUGIN_NAME: string;
declare var PLUGIN_URL: string;

export type EmailTemplate3Config = {
    pronoun: 0 | 1 | 2 | 3; // masc, fem, neutral, plural
    policy_readable: 'null' | 'yes' | 'entirely_obscured_by_popup' | 'cant_find';
    hosts_settings: Record<
        string,
        {
            presence: 'null' | 'not_mentioned' | 'mentioned_in_popup' | 'mentioned_in_policy';
            legal_basis_type: 'null' | 'consent' | 'legitimate_interest' | 'not_mentioned';
            consent_problems?:
                | 'claims_consent_but_sends_before_consent'
                | 'claims_consent_but_there_was_no_easy_refuse'
                | 'none'
                | 'null';

            legitimate_interest_activity_specified: 'null' | 'no' | 'precise' | 'vague';
            legitimate_interest_activity_description: string;
        }
    >;
    popup_type: 'none' | 'passive_cookie_banner' | 'consent';
    popup_action: 'ignored' | 'accepted' | 'closed';
    popup_closed_how: string;
    popup_screenshot_base64: string | null;
    popup_accept_all_text: string;
    popup_mentions_passive_consent: boolean;
    popup_passive_consent_text: string;
};

export default function EmailTemplate3({
    entries,
    clusters,
}: {
    entries: StolenDataEntry[];
    clusters: Record<string, RequestCluster>;
    version: number;
}): JSX.Element {
    const all_host_ids = Array.from(new Set(entries.map((entry) => entry.request.shorthost)));

    const [config, setConfig] = React.useState<EmailTemplate3Config>({
        pronoun: Math.round(Math.random()) as 0 | 1,
        policy_readable: 'null',
        hosts_settings: Object.fromEntries(
            all_host_ids.map((cluster_id) => [
                cluster_id,
                {
                    presence: 'null',
                    legal_basis_presence: 'null',
                    legal_basis_type: 'null',
                    consent_problems: 'null',
                    legitimate_interest_activity_specified: 'null',
                    legitimate_interest_activity_description: '',
                },
            ])
        ),
        popup_type: 'none',
        popup_action: 'ignored',
        popup_screenshot_base64: null,
        popup_accept_all_text: 'Zaakceptuj wszystkie',
        popup_mentions_passive_consent: false,
        popup_passive_consent_text: '',
        popup_closed_how: 'kliknięcie  przycisku „X”',
    });

    const visited_url = entries[0].request.originalURL;

    const p = config.pronoun;

    return (
        <div style={{ display: 'flex', flexFlow: 'row wrap', margin: '-1rem' }}>
            <div style={{ flexBasis: '50rem', margin: '1rem' }}>
                <EmailTemplate3Controls {...{ config, setConfig }} />
            </div>
            <article
                style={{
                    boxShadow: 'rgba(0, 0, 0, 0.2) 5px 3px 8px',
                    padding: '4rem 3rem',
                    margin: '1rem',
                    borderRadius: '0.25rem',
                    color: 'hsl(240, 5.7%, 15.8%)',
                    flexBasis: '50rem',
                }}
            >
                <p>
                    Dzień dobry, w dniu {getDate()}{' '}
                    {['odwiedziłem', 'odwiedziłam', 'odwiedziłom', 'odwiedziliśmy'][p]} stronę{' '}
                    {visited_url} i {['zbadałem', 'zbadałam', 'zbadałom', 'zbadaliśmy'][p]} ją za
                    pomocą wtyczki <a href={PLUGIN_URL}>{PLUGIN_NAME}</a> w celu zbadania, jakie
                    informacje o {['mnie', 'mnie', 'mnie', 'nas'][p]} wysyła ta strona do podmiotów
                    trzecich.
                </p>
                <p>
                    {['Moją', 'Moją', 'Moją', 'Naszą'][p]} szczególną uwagę przykuło: WYFILTROWANE
                    WZGLĘDEM TEGO, CZY DANEGO PODMIOTU NIE MA W POLITYCE PRYWATNOŚCI LUB
                    POWIADOMIENIU O COOKIESACH{' '}
                    <ul>
                        <li>
                            - wysyłanie mojego identyfikatora internetowego [z Cookie] (value) oraz
                            części mojej historii przeglądania do właściciela domeny (domain);
                        </li>
                        <li> - (...).</li>
                    </ul>
                </p>
                <p>
                    Dane te zostały wysłane zanim {['miałem', 'miałam', 'miałom', 'mieliśmy'][p]}{' '}
                    szansę przeczytać Państwa politykę prywatności i w jakikolwiek czynny i
                    jednoznaczny sposób wyrazić zgodę na takie przetwarzanie moich danych osobowych.
                </p>
                {!['yes', 'null'].includes(config.policy_readable) ? (
                    <p>
                        {['Chciałem', 'Chciałam', 'Chciałom', 'Chcieliśmy'][p]} przeczytać Państwa
                        politykę prywatności przed akceptacją, ale{' '}
                        {config.policy_readable == 'cant_find' ? (
                            <>nie mogę znaleźć jej nigdzie na Państwa stronie.</>
                        ) : (
                            ''
                        )}{' '}
                        {config.policy_readable == 'entirely_obscured_by_popup' ? (
                            <>jest ona przesłonięta przez okienko o RODO.</>
                        ) : (
                            ''
                        )}
                    </p>
                ) : (
                    ''
                )}
                <p>
                    Dane zostały udostępnione podmiotom, o których nie{' '}
                    {['znalazłem', 'znalazłam', 'znalazłom', 'znaleźliśmy'][p]} informacji ani w
                    Państwa polityce prywatności, ani w żadnym wyskakującym okienku na Państwa
                    stronie. Z tego powodu zwracam{p == 3 ? 'y' : ''} się do Państwa z pytaniem:
                    jakie były podstawy prawne takiego ujawnienia{' '}
                    {['moich', 'moich', 'moich', 'naszych'][p]} danych osobowych wyżej wymienionym
                    podmiotom? Uprzejmie {['proszę', 'proszę', 'proszę', 'prosimy'][p]} o wskazanie
                    podstawy prawnej dla każdego z tych podmiotów z osobna.
                </p>
            </article>
        </div>
    );
}
