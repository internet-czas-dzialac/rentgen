import { wordlist } from '../../../util';
import { ExplainerKey } from '../explainers';
import { v } from '../verbs';
import { Problem } from './problem';

export class UnlawfulCookieAccess extends Problem {
    getNecessaryExplainers(): ExplainerKey[] {
        return ['cookies_are_pii', 'responsibility_for_third_parties'];
    }

    qualifies(): boolean {
        // są cookiesy, nie było zgody, nie są konieczne do działania strony
        const cookie_clusters = Object.values(this.clusters).filter((c) => c.hasMarkedCookies());
        return cookie_clusters.some((cluster) => {
            const hostAnswers = this.answers.hosts[cluster.id];
            return (
                (hostAnswers.present == 'not_mentioned' ||
                    hostAnswers.present == 'not_before_making_a_choice' ||
                    ['none', 'closed_popup', 'deny_all'].includes(this.answers.popup_action) ||
                    this.answers.popup_type === 'none') &&
                hostAnswers.was_processing_necessary != 'yes'
            );
        });
    }

    getEmailContent({ mode, tone }: { mode: 'email' | 'report'; tone: 'official' | 'polite' }) {
        const cookie_clusters = Object.values(this.clusters).filter((c) => c.hasMarkedCookies());
        const unnecessary_hosts = Object.entries(this.answers.hosts)
            .filter(([, answers]) => answers.was_processing_necessary === 'no')
            .map(([host]) => host);
        const maybe_unnecessary_hosts = Object.entries(this.answers.hosts)
            .filter(([, answers]) => answers.was_processing_necessary === 'not_sure')
            .map(([host]) => host);
        const _ = (key: string) => v(key, this.answers.zaimek);
        return (
            <>
                <h2>Dostęp do cookies niezgodny z ustawą Prawo Telekomunikacyjne</h2>
                <p>
                    Państwa strona {mode == 'email' ? 'dokonała' : 'dokonuje'} odczytu plików Cookie
                    zapisanych na dysku twardym{' '}
                    {mode === 'email'
                        ? _('mojego') + ' komputera.'
                        : 'komputerach użytkowników końcowych.'}
                    . Dotyczy to plików cookie przypisanych do domen:
                </p>
                <ul>
                    {cookie_clusters.map((cluster, index) => {
                        const names = cluster
                            .getMarkedEntries()
                            .filter((e) => e.source === 'cookie')
                            .map((e) => e.name);

                        return (
                            <li>
                                {cluster.id} ({names.length > 1 ? 'pliki' : 'plik'}{' '}
                                {names.map((name, index) => {
                                    return (
                                        <>
                                            {index > 0 ? ', ' : ''}
                                            {name}
                                        </>
                                    );
                                })}
                                ){index === cookie_clusters.length - 1 ? '.' : ';'}
                            </li>
                        );
                    })}
                </ul>
                <p>
                    Zgodnie z treścią Art. 173.{' '}
                    <a href="https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20041711800/U/D20041800Lj.pdf">
                        ustawy Prawo Telekomunikacyjne
                    </a>
                    , strona może pozyskać dostęp do treści plików cookies pod warunkiem spełnienia
                    jednego z następujących warunków:
                </p>
                <ol>
                    <li>
                        Użytkownik wyraził zgodę na takie przetwarzanie danych <em>po</em> tym, jak
                        został poinformowany bezpośrednio o celu uzyskania dostępu do tej
                        informacji. Zgodnie z Art. 174 ustawy Prawo Telekomunikacyjne, taka zgoda
                        musi spełniać warunki zgody ustalone przez RODO, aby mogła być jako podstawa
                        prawna uzyskania dostępu do cookies i podobnych technologii w przeglądarce;
                    </li>
                    <li>
                        Dostęp do treści plików cookies jest konieczny do dostarczania usługi
                        świadczonej drogą elektroniczną zażądanej przez użytkownika.
                    </li>
                </ol>
                {(() => {
                    if (this.answers.popup_type == 'none' || this.answers.popup_type == 'page') {
                        return mode === 'email' ? (
                            <p>
                                Jako, że strona nie pytała {_('mnie')} nigdy o zgodę, nie jest
                                spełniony warunek 1.
                            </p>
                        ) : (
                            <p>
                                Strona nie ma zaimplementowanego mechanizmu pozyskiwania zgód, zatem
                                nie spełnia warunku opisanego w punkcie 1.
                            </p>
                        );
                    } else if (this.answers.popup_type === 'passive_popup') {
                        return (
                            <p>
                                {mode === 'email' ? (
                                    <>
                                        Państwa strona nie dała mi nigdy faktycznego wyboru
                                        dotyczącego wyrażenia lub odmówienia zgody na takie
                                        przetwarzanie danych osobowych. Aby zgoda była ważna w
                                        świetle RODO, musi być dobrowolna. Brak możliwości
                                        odmówienia zgody sprawia, że tak wyrażona „zgoda” nie jest
                                        ważna w świetle RODO. Dlatego nie jest spełniony warunek 1.{' '}
                                    </>
                                ) : (
                                    <>
                                        Aktualnie zaimplementowane okienko o przetwarzaniu danych
                                        osobowych nie daje użytkownikom końcowym możliwości odmowy
                                        wyrażenia zgody, przez co tak wyrażona „zgoda” nie spełnia
                                        warunku dobrowolności opisanego w motywie (32) RODO. Z tego
                                        powodu nie jest spełniony warunek opisany w punkcie 1.
                                        powyżej, zatem tak pozyskana "zgoda" nie może stanowić
                                        podstawy prawnej dostępu do cookiesów użytkownika końcowego.
                                    </>
                                )}{' '}
                                {this.answers.mentions_passive_consent ? (
                                    <>
                                        Należy nadmienić także, że zgody wyrażonej w sposób bierny
                                        lub milczący nie można uznać za ważną w świetle
                                        obowiązujących przepisów rozporządzenia 2016/679. Dlatego
                                        zaniechanie zmiany ustawień przeglądarki lub po prostu
                                        korzystanie ze strony nie stanowi ważnej zgody. Takie jest{' '}
                                        <a href="https://assets.midline.pl/pisma/2021-12-16%20odpowiedz%20UODO%20na%20skarg%C4%99%20i(n)Secure.pdf">
                                            stanowisko polskiego UODO
                                        </a>
                                        .
                                    </>
                                ) : (
                                    ''
                                )}
                            </p>
                        );
                    } else if (this.answers.popup_type === 'some_choice') {
                        if (this.answers.popup_action === 'none') {
                            return mode == 'email' ? (
                                <p>
                                    Nie {_('wyraziłem')} zgody na takie przetwarzanie {_('moich')}{' '}
                                    danych osobowych. W okienku pytającym o zgodę nic nie{' '}
                                    {_('kliknąłem')}. Nie jest zatem spełniony warunek 1.
                                </p>
                            ) : (
                                <p>
                                    Skrypty pozyskujące dostęp do plików cookie uruchamiają się
                                    zanim użytkownik końcowy zdąży wybrać jakąkolwiek opcję w
                                    okienku pytającym o zgodę. Aby zgoda była ważna, musi być
                                    pozyskana <strong>zanim</strong> nastąpi proces przetwarzania
                                    danych, którego ta zgoda dotyczy. Z tego powodu nie jest
                                    spełniony warunek 1. Nie można używać tak pozyskanej „zgody”
                                    jako podstawy prawnej dostępu do plików cookies na urządzeniu
                                    użytkownika końcowego.
                                </p>
                            );
                        } else if (this.answers.popup_action === 'closed_popup') {
                            return mode == 'email' ? (
                                <p>
                                    Nie {_('wyraziłem')} zgody na takie przetwarzanie {_('moich')}{' '}
                                    danych osobowych. {this.answers.popup_closed_how.trim()}
                                    {this.answers.popup_closed_how.trim().at(-1) != '.'
                                        ? '.'
                                        : ''}{' '}
                                    Takiego działania nie można uznać za ważną zgodę na
                                    przetwarzanie danych osobowych, gdyż nie spełnia warunku
                                    jednoznaczności opisanego w Art. 4, pkt 11 RODO. Nie jest zatem
                                    spełniony warunek 1.
                                </p>
                            ) : (
                                <p>
                                    Gdy użytkownik końcowy strony nie wyrazi jednoznacznej zgody w
                                    wyskakującym okienku, a zamiast tego po prostu zamknie to
                                    okienko, strona nadal pozyskuje dostęp do plików cookies na
                                    urządzeniu użytkownika. Zamknięcia okienka (np. przyciskiem „x”)
                                    nie można uznać za ważną zgodę, gdyż taka czyność nie spełnia
                                    warunku jednoznaczności opisanego w Art. 4. pkt 11. RODO. Nie
                                    jest zatem spełniony warunek 1.
                                </p>
                            );
                        } else if (this.answers.popup_action == 'deny_all') {
                            return mode == 'email' ? (
                                <p>
                                    {this.answers.popup_deny_all_how.trim()}
                                    {this.answers.popup_closed_how.trim().at(-1) != '.'
                                        ? '.'
                                        : ''}{' '}
                                    Zatem nie jest spełniony warunek 1.
                                </p>
                            ) : (
                                <p>
                                    Gdy użytkownik jednoznacznie odmówi zgód na wszystkie cele
                                    przetwarzania, strona nadal pozyskuje dostęp do plików cookies
                                    na urządzeniu użytkownika. Jeżeli uzytkownik nie odmówił zgody,
                                    to nie powinny załączać się procesy przetwarzania powołujące się
                                    na zgodę jako podstawę prawną.
                                </p>
                            );
                        }
                    }
                })()}
                {unnecessary_hosts.length > 0 ? (
                    mode == 'email' ? (
                        <p>
                            W {_('mojej')} ocenie odczytywanie przez Państwa stronę treści plików
                            cookies z {wordlist(unnecessary_hosts)} nie jest konieczne do
                            wyświetlenia treści Państwa strony, dlatego nie jest dla nich spełniony
                            warunek 2. Jeżeli według Państwa oceny jest inaczej, {_('proszę')} o
                            wskazanie, co jest źródłem tej konieczności i co odróżnia Państwa stronę
                            od wielu innych stron, które realizują te same funkcjonalności{' '}
                            <em>bez</em> korzystania z plików Cookie.
                        </p>
                    ) : (
                        <p>
                            Warto, aby informacje na stronie opisywały w zrozumiały sposob, które z
                            podmiotów, których skrypty uruchamiają się na stronie (
                            {wordlist(unnecessary_hosts)}) są konieczne do działania strony, jaki
                            zakres danych przetwarzają i w jakim celu.
                        </p>
                    )
                ) : (
                    ''
                )}
                {mode == 'email' ? (
                    tone === 'official' ? (
                        <p>
                            {_('Proszę')} o wskazanie,{' '}
                            <strong>
                                czy być może stosowali Państwo inną podstawę prawną do takiego
                                przetwarzania {_('moich')} danych osobowych, czy być może
                                przetwarzali je Państwo bez ważnej podstawy prawnej?
                            </strong>
                        </p>
                    ) : (
                        <p>
                            Apeluję o wdrożenie zmian na Państwa stronie tak, aby użytkownik miał
                            faktyczny wybór dotyczący procesów przetwarzania jego danych osobowych,
                            jakie zachodzą w trakcie odwiedzin tej strony.
                        </p>
                    )
                ) : (
                    <>
                        <p>
                            Jeżeli zgoda nadal ma być używana jako podstawa prawna do odczytu plików
                            cookies przez skrypty wyżej wymienionych podmiotów, to należy zmienić
                            mechanizm zgody tak, aby:{' '}
                        </p>{' '}
                        <ul>
                            <li>
                                dawał użytkownikowi końcowemu możliwość odmowy zgody w sposób równie
                                łatwy i dostępny, jak na wyrażenie zgody;
                            </li>
                            <li>
                                skrypty śledzące uruchamiały się dopiero po uzyskaniu ważnej zgody;
                            </li>
                            <li>
                                skrypty śledzące nie uruchamiały się, jeżeli użytkownik nie wyraził
                                na nie zgody.
                            </li>
                        </ul>
                    </>
                )}
                {maybe_unnecessary_hosts.length > 1 && mode == 'email' && tone == 'official' ? (
                    <p>
                        {_('Proszę')} też o wskazanie, czy dostęp do treści plików cookie z
                        {wordlist(maybe_unnecessary_hosts)} jest konieczny do poprawnego działania
                        strony? Jeżeli tak, to {_('proszę')} wskazać, w jaki sposób. Co sprawia, że
                        strona nie może działać bez nich?
                    </p>
                ) : (
                    ''
                )}
            </>
        );
    }
}
