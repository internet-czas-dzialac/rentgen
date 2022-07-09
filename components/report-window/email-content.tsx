import { RequestCluster } from '../../request-cluster';
import deduceProblems from './deduce-problems';
import { Explainers } from './explainers';
import { ParsedAnswers } from './parse-answers';
import { v } from './verbs';
import './email-content.scss';
import { Fragment, useState } from 'react';
import emailIntro from './email-intro';
import { reportIntro } from './report-intro';

const SS_URL = 'http://65.108.60.135:3000';

export default function EmailContent({
    answers,
    visited_url,
    clusters,
    scrRequestPath,
    downloadFiles,
    user_role,
}: {
    answers: ParsedAnswers;
    visited_url: string;
    clusters: Record<string, RequestCluster>;
    scrRequestPath: string;
    downloadFiles: Function;
    user_role: string;
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
        const container = document.querySelector('.mail-container__content');
        if (!container) return;
        r.selectNode(container);
        window.getSelection()?.addRange(r);
        document.execCommand('copy');
        window.getSelection()?.removeAllRanges();
        setCopy(true);
    }

    const mode = answers.user_role === 'user' ? 'email' : 'report';
    const email_tone = answers.email_type === 'polite_information' ? 'polite' : 'official';

    return (
        <Fragment>
            <div className="generator-container">
                <h1>Treść {mode === 'email' ? 'maila' : 'raportu'}</h1>
                <div className="mail-container">
                    <div className="mail-container__header">
                        <div className="mail-container__header--control"></div>
                    </div>
                    <article className="mail-container__content">
                        {mode === 'email'
                            ? emailIntro(email_tone, _, visited_url)
                            : reportIntro(visited_url)}
                        {problems.map((problem, index) => {
                            const Component = problem.getEmailContent.bind(problem);
                            return <Component mode={mode} tone={email_tone} key={index} />;
                        })}
                        {explainers.map((explainer) => explainer(answers.zaimek))}
                        <h2>Państwa rola jako współadministratora danych osobowych</h2>
                        {mode == 'email' ? (
                            <p>
                                {_('Zwracam')} Państwa uwagę na fakt, że w myśl{' '}
                                <a href="https://curia.europa.eu/juris/document/document.jsf?text=&docid=216555&pageIndex=0&doclang=PL&mode=lst&dir=&occ=first&part=1&cid=1254905">
                                    treści wyroku TSUE w sprawie C-40/17
                                </a>{' '}
                                poprzez wysyłanie moich danych w wyżej opisanym zakresie stają się
                                Państwo współadministratorem {_('moich')} danych osobowych, nawet
                                jeżeli nie są Państwo bezpośrednimi autorami osadzonych na Państwa
                                stronie skryptów czy innych zasobów ujawniających dane użytkowników
                                Państwa strony podmiotom trzecim. Dlatego ciąży na Państwu obowiązek
                                odpowiedzi na {_('moje')} pytania na mocy Art. 12 i 13
                                Rozporządzenia 2016/679 Parlamentu Europejskiego i Rady (UE) z dnia
                                27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z
                                przetwarzaniem danych osobowych i w sprawie swobodnego przepływu
                                takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne
                                rozporządzenie o ochronie danych) – RODO
                            </p>
                        ) : (
                            <p>
                                W myśl{' '}
                                <a href="https://curia.europa.eu/juris/document/document.jsf?text=&docid=216555&pageIndex=0&doclang=PL&mode=lst&dir=&occ=first&part=1&cid=1254905">
                                    treści wyroku TSUE w sprawie C-40/17
                                </a>
                                , ponoszą Państwo współodpowiedzialność za skrypty i inne zasoby
                                ujawniajace dane osobowe na Państwa stronie, nawet jeżeli nie są
                                Państwo ich bezpośrednimi autorami.
                            </p>
                        )}
                    </article>
                </div>
                <div
                    className={
                        scrRequestPath
                            ? 'buttons-email-container'
                            : 'buttons-email-container buttons-email-container--single'
                    }
                >
                    {scrRequestPath ? (
                        <button
                            className="sv_prev_btn"
                            onClick={() => downloadFiles(`${SS_URL}${scrRequestPath}`)}
                        >
                            Pobierz zrzuty ekranów
                        </button>
                    ) : null}
                    <button
                        className={
                            scrRequestPath ? 'sv_next_btn' : 'sv_next_btn sv_next_btn--single'
                        }
                        onClick={() => copyTextToClipboard()}
                    >
                        {copied ? 'Skopiowano!' : 'Kopiuj treść'}
                    </button>
                </div>
                {copied && user_role === 'user' ? (
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
