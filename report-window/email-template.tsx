import { RequestCluster } from '../request-cluster';
import { StolenDataEntry } from '../stolen-data-entry';
import EmailTemplate3 from './email-template-3';

export default function EmailTemplate({
    entries,
    clusters,
    version,
}: {
    entries: StolenDataEntry[];
    clusters: Record<string, RequestCluster>;
    version: number;
}) {
    return (
        <div>
            <EmailTemplate3 {...{ entries, clusters, version }} />
        </div>
    );
}
