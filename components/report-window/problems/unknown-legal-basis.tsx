import { RequestCluster } from '../../../request-cluster';
import { ExplainerKey } from '../explainers';
import { ParsedHostAnswers } from '../parse-answers';
import { v } from '../verbs';
import { Problem } from './problem';

const testCluster: (cluster: RequestCluster, answers: ParsedHostAnswers | undefined) => boolean = (
    cluster,
    hostAnswers
) => {
    if (!hostAnswers) {
        return false;
    }
    if (cluster.hasMarkedCookies()) {
        /* if it has cookies, it will be picked up by the UnlawfulCookieAccess problem, and that one
        is pretty detailed, so no need to mention it here. */
        return false;
    }
    return hostAnswers.legal_basis_type == 'not_mentioned';
};

export class UnknownLegalBasis extends Problem {
    getNecessaryExplainers(): ExplainerKey[] {
        return ['responsibility_for_third_parties'];
    }

    qualifies(): boolean {
        return Object.values(this.clusters).some((cluster) =>
            testCluster(cluster, this.answers.hosts[cluster.id])
        );
    }

    getRelatedClusters() {
        return Object.values(this.clusters).filter((cluster) =>
            testCluster(cluster, this.answers.hosts[cluster.id])
        );
    }

    getEmailContent() {
        const clusters = this.getRelatedClusters();
        const _ = (key: string) => v(key, this.answers.zaimek);
        return (
            <>
                <h2>Przetwarzanie danych osobowych bez podania podstawy prawnej</h2>
                <p>Państwa strona przetworzyła {_('moje')} dane osobowe poprzez ujawnienie:</p>
                <ul>
                    {clusters.map((cluster) => (
                        <li key={cluster.id}>
                            Właścicielowi domeny <strong>{cluster.id}</strong>:{' '}
                            {cluster.getDataTypeDescription('mojej')}
                        </li>
                    ))}
                </ul>
                <p>
                    {_('Moja')} historia przeglądania stanowi {_('moje')} dane osobowe. Zgodnie z
                    treścią Artykułu 13 p. 1 lit. c){' '}
                    <a href="https://eur-lex.europa.eu/legal-content/PL/TXT/HTML/?uri=CELEX:32016R0679&qid=1632163985520&from=PL#d1e1822-1-1">
                        RODO
                    </a>
                    , aby przetwarzać dane osobowe, trzeba poinformować osobę, której dane dotyczą,
                    o tym, jaka jest podstawa prawna takiego przetwarzania danych.
                </p>
                <p>
                    Zwracam się zatem z pytaniem:{' '}
                    <strong>
                        jakie były podstawy prawne ujawnienia moich danych każdemu z wyżej
                        wymienionych podmiotów przez Państwa stronę?
                    </strong>
                </p>
            </>
        );
    }
}
