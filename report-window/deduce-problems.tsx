import { RequestCluster } from '../request-cluster';
import { ExplainerKey } from './explainers';
import { ParsedAnswers } from './parse-answers';
import { v } from './verbs';

abstract class Problem {
    constructor(public answers: ParsedAnswers, public clusters: Record<string, RequestCluster>) {}

    getMarkedClusters() {
        return Object.values(this.clusters).filter((c) => c.hasMarks());
    }

    abstract getEmailContent(): JSX.Element;
    abstract getNecessaryExplainers(): ExplainerKey[];
}

function formatRange(cluster: RequestCluster) {
    const parts = [] as string[];
    console.log(cluster);
    if (cluster.hasMarkedCookies()) {
        parts.push('mojego identyfikatora internetowego pozyskanego z Cookie');
    }
    if (cluster.exposesOrigin()) {
        parts.push('części mojej historii przeglądania');
    }
    return parts.join(' oraz ');
}

class NoInformationAtAllProblem extends Problem {
    getEmailContent() {
        const _ = (word: string) => v(word, this.answers.zaimek);
        return (
            <>
                <h2>Brak informacji na temat przetwarzania danych osobowych</h2>
                <p>
                    {_('Moje')} dane osobowe zostały ujawnione podmiotom, które są właścicielami
                    domen:
                </p>
                <ul>
                    {this.getMarkedClusters().map((cluster) => (
                        <li key={cluster.id}>
                            {cluster.id} (w zakresie: {formatRange(cluster)})
                        </li>
                    ))}
                </ul>
                <p>
                    Na stronie brakuje jednak jakichkolwiek informacji o tym, jakie są cele
                    przetwarzania takich danych oraz jakie są podstawy prawne takiego przetwarzania.
                </p>
                <p>Zwracam się zatem do Państwa z następującymi pytaniami:</p>
                <ul>
                    <li>Jaka jest tożsamość właścicieli tych domen?</li>
                    <li>Jaki jest cel takiego przetwarzania danych przez Państwa stronę?</li>
                    <li>
                        Jaka jest podstawa prawna takiego przetwarzania moich danych osobowych przez
                        Państwa stronę?
                    </li>
                </ul>
            </>
        );
    }
    getNecessaryExplainers() {
        const explainers = [] as Array<ExplainerKey>;

        if (
            this.getMarkedClusters().some((cluster) => {
                console.log(cluster);
                return cluster.hasMarkedCookies();
            })
        ) {
            explainers.push('cookies_are_pii');
        }
        return explainers;
    }
}

class UnlawfulCookieAccess extends Problem {
    getNecessaryExplainers(): ExplainerKey[] {
        return [];
    }
    getEmailContent() {
        const cookie_clusters = Object.values(this.clusters).filter((c) => c.hasMarkedCookies());
        return (
            <>
                <h2>Dostęp do cookies niezgodny z ustawą Prawo Telekomunikacyjne</h2>
                <p>
                    Państwa strona dokonała odczytu plików Cookie zapisanych na dysku twardym mojego
                    komputera. Dotyczy to plików cookie przypisanych do domen:
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
            </>
        );
    }
    static qualifies(answers: ParsedAnswers, clusters: RequestCluster[]): boolean {
        // są cookiesy, nie było zgody, nie są konieczne do działania strony
        const cookie_clusters = Object.values(clusters).filter((c) => c.hasMarkedCookies());
        return cookie_clusters.some((cluster) => {
            const hostAnswers = answers.hosts[cluster.id];
            return (
                (hostAnswers.present == 'not_mentioned' ||
                    hostAnswers.present == 'not_before_making_a_choice' ||
                    ['none', 'closed_popup', 'deny_all'].includes(hostAnswers.popup_action)) &&
                hostAnswers.was_processing_necessary != 'yes'
            );
        });
    }
}

export default function deduceProblems(
    answers: ParsedAnswers,
    clusters: Record<string, RequestCluster>
): Problem[] {
    const problems = [];
    if (answers.popup_type === 'none') {
        problems.push(new NoInformationAtAllProblem(answers, clusters));
    }
    if (UnlawfulCookieAccess.qualifies(answers, Object.values(clusters))) {
        problems.push(new UnlawfulCookieAccess(answers, clusters));
    }
    return problems;
}
