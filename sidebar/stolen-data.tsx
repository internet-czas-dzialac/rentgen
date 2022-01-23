import React from 'react';
import { RequestCluster } from '../request-cluster';

import StolenDataCluster from './stolen-data-cluster';
import { getshorthost } from '../util';
import { getMemory } from '../memory';

import './stolen-data.scss';

export function StolenData({
    origin,
    minValueLength,
    refreshToken,
    refresh,
    cookiesOnly,
    cookiesOrOriginOnly,
}: {
    origin: string;
    refreshToken: number;
    refresh: () => void;
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
            (cluster) =>
                !cookiesOrOriginOnly ||
                cluster.hasCookies() ||
                cluster.exposesOrigin()
        );
    return (
        <div className="stolen-data-container">
            {/* <button
                    style={{ marginLeft: '1rem' }}
                    onClick={() =>
                        getMemory().removeCookiesFor(
                            origin,
                            getshorthost(new URL(origin).host)
                        )
                    }
                >
                    Wyczyść cookiesy 1st party
                </button>
                <button
                    style={{ marginLeft: '1rem' }}
                    onClick={() => {
                        getMemory().removeRequestsFor(origin);
                        refresh();
                    }}
                >
                    Wyczyść pamięć
                </button> */}

            {/* <button
                    style={{ marginLeft: '1rem' }}
                    onClick={() =>
                        window.open(
                            `/report-window/report-window.html?origin=${origin}`,
                            'new_window',
                            'width=800,height=600'
                        )
                    }
                >
                    Generuj maila
                </button> */}

            {/* <button
                    onClick={() => {
                        clusters.forEach((cluster) => cluster.autoMark());
                        refresh();
                    }}
                >
                    Zaznacz automatycznie
                </button> */}

            <span>Domeny oraz przesłane informacje</span>

            {clusters.map((cluster) => {
                return (
                    <StolenDataCluster
                        origin={origin}
                        shorthost={cluster.id}
                        key={cluster.id + origin}
                        refresh={refresh}
                        refreshToken={refreshToken}
                        minValueLength={minValueLength}
                        cookiesOnly={cookiesOnly}
                        cookiesOrOriginOnly={cookiesOrOriginOnly}
                    />
                );
            })}
        </div>
    );
}
