import React from 'react';
import { RequestCluster } from '../request-cluster';
import { Classifications, Sources } from '../stolen-data-entry';

const emailClassifications: Record<keyof typeof Classifications, string> = {
    id: 'mój identyfikator internetowy',
    history: 'część mojej historii przeglądania',
    location: 'informacje na temat mojej lokalizacji geograficznej',
};

const emailSources: Record<Sources, string> = {
    header: 'w nagłówku HTTP',
    cookie: 'z pliku Cookie',
    pathname: 'jako części adresu URL',
    queryparams: 'jako część adresu URL (query-params)',
    request_body: 'w body zapytania POST',
};

export default function DomainSummary({
    cluster,
}: {
    cluster: RequestCluster;
}) {
    return (
        <li>
            Właścicielowi domeny <strong>{cluster.id}</strong> zostały
            ujawnione:{' '}
            <ul>
                {cluster.representativeStolenData
                    .filter((entry) => entry.isMarked)
                    .map((entry) => (
                        <li key={entry.id}>
                            {emailClassifications[entry.classification]}{' '}
                            {emailSources[entry.source]} (nazwa:{' '}
                            <code>{entry.name}</code>, wartość:{' '}
                            <code>{entry.getValuePreview()}</code>)
                        </li>
                    ))}
            </ul>
        </li>
    );
}
