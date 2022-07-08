import { RequestCluster } from '../../../request-cluster';
import { ExplainerKey } from '../explainers';
import { ParsedAnswers } from '../parse-answers';

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

export abstract class Problem {
    constructor(public answers: ParsedAnswers, public clusters: Record<string, RequestCluster>) {}

    abstract getEmailContent(mode: 'email' | 'report', tone: 'polite' | 'official'): JSX.Element;
    abstract getNecessaryExplainers(): ExplainerKey[];
    abstract qualifies(): boolean;

    getMarkedClusters() {
        return Object.values(this.clusters).filter((c) => c.hasMarks());
    }

    getRangeDescription() {
        return (
            <ul>
                {this.getMarkedClusters().map((cluster) => (
                    <li key={cluster.id}>
                        {cluster.id} (w zakresie: {formatRange(cluster)})
                    </li>
                ))}
            </ul>
        );
    }
}
