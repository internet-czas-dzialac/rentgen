import { RequestCluster } from '../request-cluster';
import { getDate } from '../util';
import deduceProblems from './deduce-problems';
import { Explainers } from './explainers';
import { ParsedAnswers } from './parse-answers';
import { v } from './verbs';

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
    return (
        <div style={{ padding: '1rem' }}>
            <pre>{JSON.stringify(answers, null, 3)}</pre>
            <p>Dzień dobry,</p>
            <p>
                w dniu {getDate()} {_('odwiedziłem')} stronę {visited_url}. Po podejrzeniu ruchu
                sieciowego generowanego przez tę stronę za pomocą wtyczki{' '}
                <a href={PLUGIN_URL}>{PLUGIN_NAME}</a> w przeglądarce Firefox {_('mam')} pytania
                dotyczące przetwarzania {_('moich')} danych osobowych, na które nie {_('znalazłem')}{' '}
                odpowiedzi nigdzie na Państwa stronie.
            </p>
            {problems.map((problem) => problem.getEmailContent())}
            {explainers.map((explainer) => explainer(answers.zaimek))}
            <p>
                {_('Zwracam')} Państwa uwagę na fakt, że w myśl{' '}
                <a href="https://curia.europa.eu/juris/document/document.jsf?text=&docid=216555&pageIndex=0&doclang=PL&mode=lst&dir=&occ=first&part=1&cid=1254905">
                    treści wyroku TSUE w sprawie C-40/17
                </a>{' '}
                poprzez wysyłanie moich danych w wyżej opisanym zakresie stają się Państwo
                współadministratorem moich danych osobowych, dlatego ciąży na Państwu obowiązek
                odpowiedzi na moje pytanie na mocy Art. 12 i 13 Rozporządzenia 2016/679 Parlamentu
                Europejskiego i Rady (UE) z dnia 27 kwietnia 2016 r. w sprawie ochrony osób
                fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego
                przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o
                ochronie danych, dalej: „RODO”).
            </p>
        </div>
    );
}