import { RequestCluster } from '../../request-cluster';
import { getDate } from '../../util';
import deduceProblems from './deduce-problems';
import { Explainers } from './explainers';
import { ParsedAnswers } from './parse-answers';
import { v } from './verbs';
import './email-content.scss';
import { Fragment, useState } from 'react';

declare var PLUGIN_NAME: string;
declare var PLUGIN_URL: string;

export default function EmailContent({
    answers,
    visited_url,
    clusters,
}: {
    answers: ParsedAnswers;
    visited_url: string;
    clusters: Record<string, RequestCluster>;
}) {
    const _ = (key: string) => v(key, answers.zaimek);
    const problems = deduceProblems(answers, clusters);
    const explainers = Array.from(
        new Set(
            problems
                .map((problem) => problem.getNecessaryExplainers())
                .reduce((a, b) => a.concat(b), [])
        )
    ).map((explainer_key) => Explainers[explainer_key]);
    const [copied, setCopy] = useState<boolean>(false);

    function copyTextToClipboard() {
        // Should be changed in the future to Clipboard API (https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write#browser_compatibility)
        let r = document.createRange();
        r.selectNode(document.querySelector('.mail-container__content'));
        window.getSelection().addRange(r);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        setCopy(true);
    }

    return (
        <Fragment>
            <div className="generator-container">
                <h1>Treść maila</h1>
                <div className="mail-container">
                    <div className="mail-container__header">
                        <div className="mail-container__header--control"></div>
                    </div>
                    <article className="mail-container__content">
                        <p>Dzień dobry,</p>
                        <p>
                            w dniu {getDate()} {_('odwiedziłem')} stronę {visited_url}. Po
                            podejrzeniu ruchu sieciowego generowanego przez tę stronę za pomocą
                            wtyczki <a href={PLUGIN_URL}>{PLUGIN_NAME}</a> w przeglądarce Firefox{' '}
                            {_('mam')} pytania dotyczące przetwarzania {_('moich')} danych
                            osobowych, na które nie {_('znalazłem')} odpowiedzi nigdzie na Państwa
                            stronie.
                        </p>
                        {problems.map((problem) => problem.getEmailContent())}
                        {explainers.map((explainer) => explainer(answers.zaimek))}
                        <h2>Państwa rola jako współadministratora danych osobowych</h2>
                        <p>
                            {_('Zwracam')} Państwa uwagę na fakt, że w myśl{' '}
                            <a href="https://curia.europa.eu/juris/document/document.jsf?text=&docid=216555&pageIndex=0&doclang=PL&mode=lst&dir=&occ=first&part=1&cid=1254905">
                                treści wyroku TSUE w sprawie C-40/17
                            </a>{' '}
                            poprzez wysyłanie moich danych w wyżej opisanym zakresie stają się
                            Państwo współadministratorem moich danych osobowych, dlatego ciąży na
                            Państwu obowiązek odpowiedzi na moje pytania na mocy Art. 12 i 13
                            Rozporządzenia 2016/679 Parlamentu Europejskiego i Rady (UE) z dnia 27
                            kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z
                            przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich
                            danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o
                            ochronie danych, dalej: „RODO”).
                        </p>
                    </article>
                </div>
                <div className="buttons-container">
                    <button className="sv_next_btn" onClick={() => copyTextToClipboard()}>
                        {copied ? 'Skopiowano!' : 'Kopiuj treść wiadomości'}
                    </button>
                </div>
                {copied ? (
                    <section className="greeting-text">
                        <strong>Przed Tobą ostatni krok! 😊</strong>
                        <p>
                            <a href="mailto:?subject=Zapytanie o przetwarzanie moich danych osobowych przez Państwa stronę">
                                Przejdź do swojego klienta pocztowego
                            </a>
                            , załącz zrzuty ekranów, wklej treść wiadomości i wyślij ją do
                            administratorów witryny {visited_url.split('/').slice(0, 3).join('/')}.
                        </p>
                    </section>
                ) : null}
            </div>
        </Fragment>
    );
}
