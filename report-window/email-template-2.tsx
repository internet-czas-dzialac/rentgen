import React, { useState } from 'react';
import { RequestCluster } from '../request-cluster';
import { StolenDataEntry } from '../stolen-data-entry';
import { getDate, unique } from '../util';
import DomainSummary from './domain-summary';
import EmailTemplate2Controls from './email-template-2-controls';

export type EmailTemplate2Config = {
    popup_type: 'none' | 'passive_cookie_banner' | 'consent';
    popup_action: 'ignored' | 'accepted' | 'closed';
    popup_closed_how: string;
    popup_screenshot_base64: string | null;
    popup_accept_all_text: string;
    popup_mentions_passive_consent: boolean;
    popup_passive_consent_text: string;
};

function ClusterRangeSummary({ cluster }: { cluster: RequestCluster }) {
    const range = unique(
        cluster.getMarkedEntries().map((entry) => entry.classification)
    );
    const has_cookie_ids = cluster
        .getMarkedEntries()
        .filter((entry) => entry.source === 'cookie')
        .some((entry) => entry.classification == 'id');
    return (
        <>
            {[
                'Pańskiego adresu IP',
                range.includes('id')
                    ? 'Pańskiego identyfikatora internetowego' +
                      (has_cookie_ids ? ' z cookie' : '')
                    : '',
                range.includes('history')
                    ? 'części Pańskiej historii przeglądania'
                    : '',
                range.includes('location')
                    ? 'informacji na temat Pana położenia'
                    : '',
            ]
                .filter((e) => e !== '')
                .join(', ')}
        </>
    );
}

function Placeholder({ children }: { children: string }) {
    return (
        <span
            style={{
                textDecoration: 'underline',
                fontSize: '0.8em',
                position: 'relative',
                textUnderlineOffset: '4px',
                bottom: '3px',
            }}
        >
            <span
                dangerouslySetInnerHTML={{ __html: '&nbsp;'.repeat(12) }}
            ></span>
            <span style={{ color: 'gray' }}>({children})</span>
            <span
                dangerouslySetInnerHTML={{ __html: '&nbsp;'.repeat(12) }}
            ></span>
        </span>
    );
}

function Base64Image({ base64 }: { base64: string }) {
    return <img style={{ maxWidth: '100%' }} {...{ src: base64 }} />;
}

export default function EmailTemplate2({
    entries,
    clusters,
}: {
    entries: StolenDataEntry[];
    clusters: Record<string, RequestCluster>;
    version: number;
}): JSX.Element {
    const [config, setConfig] = useState<EmailTemplate2Config>({
        popup_type: 'none',
        popup_action: 'ignored',
        popup_screenshot_base64: null,
        popup_accept_all_text: 'Zaakceptuj wszystkie',
        popup_mentions_passive_consent: false,
        popup_passive_consent_text: '',
        popup_closed_how: 'kliknięcie  przycisku „X”',
    });

    const visited_url = entries[0].request.originalURL;

    return (
        <>
            <EmailTemplate2Controls {...{ config, setConfig }} />
            <p>
                Dzień dobry, w dniu {getDate()} odwiedziłem stronę {visited_url}
                .
            </p>
            {config.popup_type === 'none' ? (
                <p>
                    Nie ukazał mi się na stronie żaden mechanizm pozyskujący
                    zgodę na przetwarzanie moich danych osobowych lub
                    umożliwiający mi wyrażenie sprzeciwu wobec przetwarzania
                    przez stronę moich danych osobowych w zakresie wykraczającym
                    poza procesy konieczne do wyświetlenia strony
                </p>
            ) : config.popup_type == 'passive_cookie_banner' ? (
                <>
                    <p>
                        Na stronie była widoczna informacja o plikach Cookie.{' '}
                    </p>
                    <p>
                        <Base64Image
                            {...{ base64: config.popup_screenshot_base64 }}
                        />
                    </p>
                </>
            ) : (
                <>
                    <p>
                        Ukazało mi się okienko z informacjami i pytaniami
                        dotyczącymi sposobów, w jaki strona przetwarza moje dane
                        osobowe.{' '}
                    </p>
                    <p>
                        <Base64Image
                            {...{ base64: config.popup_screenshot_base64 }}
                        />
                    </p>
                    <p>
                        {config.popup_action === 'ignored'
                            ? /* HTML */ `Nie kliknąłem żadnego przycisku w tym
                              okienku. W szczególności nie kliknąłem przycisku
                              „${config.popup_accept_all_text}”.`
                            : config.popup_action === 'accepted'
                            ? `Kliknąłem na widoczną w tym okienku opcję „${config.popup_accept_all_text}”.`
                            : ''}
                    </p>
                </>
            )}
            <p>
                W tym samym czasie rejestrowałem ruch sieciowy generowany przez
                tę stronę za pomocą narzędzi w przeglądarce Firefox. Okazało
                się, że Państwa strona wysłała była moje dane osobowe do
                następujących podmiotów:
            </p>
            <ul>
                {Object.values(clusters)
                    .filter((cluster) => cluster.hasMarks())
                    .map((cluster) => (
                        <DomainSummary cluster={cluster} key={cluster.id} />
                    ))}
            </ul>
            {config.popup_action === 'ignored' ? (
                <p>
                    Dane te zostały wysłane, zanim kliknąłem cokolwiek na tej
                    stronie.
                </p>
            ) : config.popup_action === 'accepted' ? (
                <p>
                    Dane te zostały wysłane po tym, jak kliknąłem przycisk „
                    {config.popup_accept_all_text}”
                </p>
            ) : (
                ''
            )}
            <p>
                W załączeniu przesyłam część zrzutów ekranu dokumentujących fakt
                wysłania tych danych przez Państwa stronę.{' '}
            </p>
            <h3>Podstawa prawna</h3>
            <p>
                Ustawa Prawo Telekomunikacyjne w art. 173 reguluje warunki,
                które musi spełnić administrator strony, aby jego strona mogła
                zapisywać i czytać treść plików cookie. Nie reguluje jednak
                tego, jakim podmiotom i w jakim zakresie dane mogą być{' '}
                <em>ujawniane</em> przez stronę. Tym zajmuje się Rozporządzenie
                2016/679 Parlamentu Europejskiego i Rady (UE) z dnia 27 kwietnia
                2016 r. w sprawie ochrony osób fizycznych w związku z
                przetwarzaniem danych osobowych i w sprawie swobodnego przepływu
                takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne
                rozporządzenie o ochronie danych) – RODO. Zapis/odczyt plików
                cookie a ujawnianie ich treści podmiotom trzecim to dwa różne
                procesy. Niniejsza wiadomość i pytania w niej zawarte dotyczą
                właśnie <em>ujawniania</em> moich danych osobowych (pochodzących
                m.in. z Cookies) podmiotom trzecim.
            </p>
            <p>
                W kontekście stron internetowych są właściwie dopuszczalne tylko
                trzy z sześciu wymienionych w Art. 6 pkt 1 RODO podstaw prawnych
                dla przetwarzania danych osobowych:
            </p>
            <ol>
                <li>
                    „Zgoda” &mdash; osoba, której dane dotyczą wyraziła zgodę na
                    przetwarzanie swoich danych osobowych w jednym lub większej
                    liczbie określonych celów (<em>Art. 6 pkt 1 lit. a)</em>).
                </li>
                <li>
                    „Niezbędność” &mdash; przetwarzanie jest niezbędne do
                    wykonania umowy, której stroną jest osoba, której dane
                    dotyczą, lub do podjęcia działań na żądanie osoby, której
                    dane dotyczą, przed zawarciem umowy (
                    <em>Art. 6 pkt 1 lit. b)</em>);{' '}
                </li>
                <li>
                    „Uzasadniony Interes” &mdash; przetwarzanie jest niezbędne
                    do celów wynikających z prawnie uzasadnionych interesów
                    realizowanych przez administratora lub przez stronę trzecią,
                    z wyjątkiem sytuacji, w których nadrzędny charakter wobec
                    tych interesów mają interesy lub podstawowe prawa i wolności
                    osoby, której dane dotyczą, wymagające ochrony danych
                    osobowych, w szczególności gdy osoba, której dane dotyczą,
                    jest dzieckiem (<em>Art. 6 pkt 1 lit. f)</em>
                    );
                </li>
            </ol>
            <p>
                W przypadku opisywanej przeze mnie mojej wizyty na Państwa
                stronie nie ma zastosowania „Zgoda”, gdyż{' '}
                {config.popup_action === 'ignored' ? (
                    <>
                        nie wyrażałem żadnej zgody na takie przetwarzanie moich
                        danych
                        {config.popup_type === 'consent' ? (
                            <>
                                &mdash; w szczególności nie kliknąłem przycisku
                                „{config.popup_accept_all_text}”
                            </>
                        ) : (
                            ''
                        )}
                        .
                    </>
                ) : config.popup_action === 'accepted' ? (
                    <>
                        o ile po wejściu na stronę wcisnąłem w wyskakującym
                        okienku przycisk „{config.popup_accept_all_text}”, o
                        tyle nie stanowi to według mnie ważnej w świetle RODO
                        zgody, gdyż brakowało w tym okienku równie łatwo
                        osiągalnego przycisku, którego kliknięcie skutkowałoby
                        zasygnalizowaniem braku mojej zgody na takie
                        przetwarzanie moich danych. Mówiąc wprost &mdash;
                        wyrażenie „zgody” było łatwiejsze niż jej niewyrażenie.
                        Niewyrażenie zgody wiąże się z negatywną konsekwencją
                        konieczności przechodzenia przez dodatkowe kroki w
                        wyskakującym okienku. Zatem tak otrzymana przez Państwo
                        moja „zgoda” nie jest poprawną podstawą prawną do
                        przetwarzania moich danych osobowych, gdyż nie spełnia
                        warunku dobrowolności wspomnianego w motywie (42) RODO.
                    </>
                ) : config.popup_action === 'closed' ? (
                    <>
                        zamknąłem okienko pytające o zgodę poprzez{' '}
                        {config.popup_closed_how}. Nie może być to uznane za
                        zgodę, bo nie spełnia to warunku jednoznaczności
                        opisanego w motywie (32) Rozporządzenia 2016/679.{' '}
                    </>
                ) : (
                    ''
                )}{' '}
                Za zgodę nie można też uznać posiadania włączonej obsługi
                cookies w przeglądarce (gdyż aby zgoda była ważna, musi być
                szczegółowa dla każdego celów z osobna), jakichkolwiek innych
                ustawień przeglądarki, ani pasywnych działań z mojej strony (np.
                „kontynuowanie korzystania ze strony”)
                {config.popup_mentions_passive_consent ? (
                    <>
                        {' '}
                        &mdash; nieprawdą więc jest zawarty na Państwa stronie
                        komunikat „{config.popup_passive_consent_text.trim()}”
                        (por. paragraf 97.{' '}
                        <a href="https://edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_202005_consent_pl.pdf">
                            oficjalnych wytycznych EROD dotyczących zgody na
                            mocy rozporządzenia 2016/679
                        </a>
                        )
                    </>
                ) : (
                    ''
                )}
                .
            </p>
            <p>
                W mojej ocenie „Niezbędność“ nie ma zastosowania co do opisanych
                powyżej sposobów przetwarzania danych. Nie widzę, co miałoby
                sprawiać, aby wysyłanie moich danych osobowych do wspomnianych
                powyżej podmiotów trzecich było konieczne do wyświetlenia
                Państwa strony na ekranie mojego komputera (zob.{' '}
                <a href="https://edpb.europa.eu/system/files/2021-11/edpb_guidelines_082020_on_the_targeting_of_social_media_users_pl_0.pdf">
                    Wytyczne 8/2020 EROD dotyczące targetowania użytkowników
                    mediów społecznościowych
                </a>
                , par. 49);.{' '}
            </p>
            <p>
                Pozostaje zatem „Uzasadniony Interes”. Aby Administrator mógł
                używać uzasadnionego interesu jako podstawy prawnej targetowania
                użytkowników Sieci, muszą zostać spełnione m.in. następujące
                warunki:{' '}
            </p>
            <ol>
                <li>
                    Administrator danych lub podmiot trzeci, któremu dane są
                    ujawniane musi{' '}
                    <strong>
                        faktycznie realizować dany konkretny uzasadniony interes
                    </strong>{' '}
                    (
                    <a href="https://curia.europa.eu/juris/document/document.jsf?text=&docid=216555&pageIndex=0&doclang=PL&mode=lst&dir=&occ=first&part=1&cid=1254905">
                        Wyrok TSUE z dnia 29 lipca 2019 r. w sprawie Fashion ID,
                        C-40/17, ECLI:EU:C:2019:629
                    </a>
                    , pkt 95.)
                </li>
                <li>
                    Takie przetwarzanie danych jest <strong>konieczne</strong>{' '}
                    dla potrzeb wynikających z danego uzasadnionego interesu (
                    <a href="https://curia.europa.eu/juris/document/document.jsf?text=&docid=216555&pageIndex=0&doclang=PL&mode=lst&dir=&occ=first&part=1&cid=1254905">
                        Wyrok TSUE z dnia 29 lipca 2019 r. w sprawie Fashion ID,
                        C-40/17, ECLI:EU:C:2019:629
                    </a>
                    , pkt 95.)
                </li>
                <li>
                    Wybrany uzasadniony interes musi mieć pierwszeństwo nad
                    prawami i wolnościami osoby, której dotyczą przetwarzane
                    dane (
                    <a href="https://curia.europa.eu/juris/document/document.jsf?text=&docid=216555&pageIndex=0&doclang=PL&mode=lst&dir=&occ=first&part=1&cid=1254905">
                        Wyrok TSUE z dnia 29 lipca 2019 r. w sprawie Fashion ID,
                        C-40/17, ECLI:EU:C:2019:629
                    </a>
                    , pkt 95.)
                </li>
                <li>
                    Osoby, których dane dotyczą, powinny mieć możliwość
                    wyrażenia sprzeciwu wobec przetwarzania ich danych do celów
                    związanych z targetowaniem{' '}
                    <strong>przed rozpoczęciem przetwarzania</strong> (zob.{' '}
                    <a href="https://edpb.europa.eu/system/files/2021-11/edpb_guidelines_082020_on_the_targeting_of_social_media_users_pl_0.pdf">
                        Wytyczne 8/2020 EROD dotyczące targetowania użytkowników
                        mediów społecznościowych
                    </a>
                    , par. 54);
                </li>
            </ol>
            {config.popup_action !== 'accepted' ? (
                <p>
                    Moje dane zostały ujawnione podmiotom trzecim tuż po
                    włączeniu strony, zatem nie jest spełniony warunek 4.
                    Apeluję o wdrożenie zmian na stronie, które sprawią, że
                    dopiero po świadomym niewyrażeniu sprzeciwu przez
                    użytkownika aktywowane są procesy przetwarzania danych
                    osobowych, których podstawą prawną jest uzasadniony interes.
                </p>
            ) : (
                ''
            )}
            <p>
                Jeżeli istnieją jednak inne niż uzasadniony interes ważne
                podstawy prawne do takiego przetwarzania moich danych osobowych
                przez Państwa stronę, proszę o ich wskazanie,{' '}
                <em>dla każdego z wymienionych podmiotów z osobna</em>.
                (Przypominam, że Art. 173 ustawy Prawo Telekomunikacyjne nie ma
                tutaj zastosowania, ponieważ nie pytam o zapis/odczyt plików na
                moim komputerze, tylko o ujawnianie moich danych osobowych
                podmiotom trzecim). W przeciwnym wypadku, aby ustalić, czy moje
                dane były przez Państwa przetwarzane na mocy uzasadnionego
                interesu zgodnie z prawem, proszę o wypełnienie następującego
                szablonu (lub udzielenie tych samych informacji w innej postaci,
                przy zachowaniu zakresu i szczegółowości informacji:
            </p>
            <div style={{ border: '1px solid black', padding: '1rem' }}>
                <p>
                    W dniu {getDate()} strona {visited_url}:
                </p>
                <ul>
                    {Object.values(clusters)
                        .filter((cluster) => cluster.hasMarks())
                        .map((cluster) => (
                            <li
                                key={cluster.id}
                                style={{ paddingBottom: '1rem' }}
                            >
                                ujawniła pańskie dane w zakresie{' '}
                                <em>
                                    <ClusterRangeSummary {...{ cluster }} />
                                </em>{' '}
                                firmie <Placeholder>nazwa firmy</Placeholder>,
                                która jest właścicielem domeny{' '}
                                <strong>{cluster.id}</strong> i swoją politykę
                                prywatności publikuje pod adresem{' '}
                                <Placeholder>
                                    adres URL polityki prywatności tej firmy
                                </Placeholder>
                                . Podstawą prawną takiego przetwarzania danych
                                przez naszą stronę jest uzasadniony interes:{' '}
                                <Placeholder>
                                    na czym polega ten uzasadniony interes, tzn.
                                    bieżące działania podejmowane przez podmiot
                                    realizujący ten interes lub korzyści dla
                                    podmiotu realizującego ten interes
                                    oczekiwane w bardzo bliskiej przyszłości
                                </Placeholder>{' '}
                                realizowany przez{' '}
                                <Placeholder>
                                    kogo? jaki podmiot podejmuje wspomniane
                                    działania lub jest beneficjentem
                                    wspomnianych korzyści?
                                </Placeholder>
                                . Ujawnienie{' '}
                                <ClusterRangeSummary {...{ cluster }} /> temu
                                podmiotowi przez naszą stronę było konieczne dla
                                potrzeb wynikających z tego interesu, ponieważ
                                <Placeholder>
                                    uzasadnienie konieczności
                                </Placeholder>
                                .<br />
                            </li>
                        ))}
                </ul>
            </div>
            <p>
                Proszę w szczególności zwrócić uwagę na podanie adresów do
                polityk prywatności tych firm, abym wiedział, jak skontaktować
                się z nimi i wnioskować o usunięcie z ich baz wysłanych przez
                Państwa stronę moich danych. )
            </p>
            <p>
                W odpowiedzi proszę się nie powoływać na IAB Europe i ich
                rzekomą renomę w tworzeniu rozwiązań zgodnych z RODO. IAB chroni
                interes reklamodawców, a nie Użytkowników, i ich rozwiązania
                (np. TCF) są{' '}
                <a href="https://panoptykon.org/search/site/IAB">
                    notorycznie niezgodne z RODO i pozbawione szacunku dla
                    Użytkowników
                </a>
                .
            </p>
            <p>
                Apeluję także o wprowadzenie stosownych zmian na stronie tak,
                aby nie pozostawiać cienia wątpliwości odnośnie tego, na mocy
                jakiej przesłanki legalizującej dane są przetwarzane przez
                wspomniane podmioty trzecie, lub tak, aby te dane po prostu nie
                były wysyłane. Pomoże to zachować prywatność innym użytkownikom
                Państwa strony. Polecam Państwa uwadze
                <a href="https://edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_202005_consent_pl.pdf">
                    {' '}
                    oficjalne wytyczne EROD dotyczące zgody w kontekście RODO
                </a>
                . Aby na przykład zapobiec automatycznemu wysyłaniu historii
                przeglądania do podmiotów trzecich przez Państwa stronę, można
                po prostu ustawić odpowiednio treść nagłówka{' '}
                <a href="https://developer.mozilla.org/pl/docs/Web/HTTP/Headers/Referrer-Policy">
                    Referrer-Policy{' '}
                </a>
                .
            </p>
        </>
    );
}
