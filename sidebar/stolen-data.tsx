import { getMemory } from '../memory';
import { RequestCluster } from '../request-cluster';

import StolenDataCluster from './stolen-data-cluster';

import './stolen-data.scss';

export function StolenData({
    origin,
    minValueLength,
    eventCounts,
    cookiesOnly,
    cookiesOrOriginOnly,
}: {
    origin: string;
    eventCounts: Record<string, number>;
    minValueLength: number;
    cookiesOnly: boolean;
    cookiesOrOriginOnly: boolean;
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
            <span>Domeny oraz przesłane informacje</span>

            {clusters.map((cluster) => {
                return (
                    <StolenDataCluster
                        origin={origin}
                        shorthost={cluster.id}
                        key={cluster.id + origin}
                        refreshToken={eventCounts[cluster.id]}
                        minValueLength={minValueLength}
                        cookiesOnly={cookiesOnly}
                        cookiesOrOriginOnly={cookiesOrOriginOnly}
                    />
                );
            })}
        </div>
    );
}
