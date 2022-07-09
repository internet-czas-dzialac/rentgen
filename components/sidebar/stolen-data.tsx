import { getMemory } from '../../memory';
import { RequestCluster } from '../../request-cluster';

import StolenDataCluster from './stolen-data-cluster';

import './stolen-data.scss';

export function StolenData({
    origin,
    minValueLength,
    eventCounts,
    cookiesOnly,
    cookiesOrOriginOnly,
    detailsVisibility,
}: {
    origin: string;
    eventCounts: Record<string, number | undefined>;
    minValueLength: number;
    cookiesOnly: boolean;
    cookiesOrOriginOnly: boolean;
    detailsVisibility: boolean;
}) {
    if (!origin) {
        return (
            <div className="stolen-data-container">
                <span>Otwórz nową kartę z wybraną stroną internetową</span>
            </div>
        );
    }
    const clusters = Object.values(getMemory().getClustersForOrigin(origin))
        .sort(RequestCluster.sortCompare)
        .filter((cluster) => !cookiesOnly || cluster.hasCookies())
        .filter(
            (cluster) => !cookiesOrOriginOnly || cluster.hasCookies() || cluster.exposesOrigin()
        );
    return (
        <div className="stolen-data-container">
            <span>Domeny{detailsVisibility ? ' oraz przesłane informacje' : null}</span>

            {clusters.map((cluster) => {
                return (
                    <StolenDataCluster
                        origin={origin}
                        shorthost={cluster.id}
                        key={cluster.id + origin}
                        refreshToken={eventCounts[cluster.id] || 0}
                        minValueLength={minValueLength}
                        cookiesOnly={cookiesOnly}
                        cookiesOrOriginOnly={cookiesOrOriginOnly}
                        detailsVisibility={detailsVisibility}
                    />
                );
            })}
        </div>
    );
}
