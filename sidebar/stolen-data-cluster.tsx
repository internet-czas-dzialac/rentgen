import React from 'react';
import { getMemory } from '../memory';
import { StolenDataEntry } from '../stolen-data-entry';

import { maskString, useEmitter } from '../util';

import './stolen-data-cluster.scss';

const MAX_STRING_VALUE_LENGTH = 100;

function StolenDataValue({
    entry,
    refresh,
}: {
    entry: StolenDataEntry;
    refresh: Function;
    prefixKey?: string;
}) {
    const [version] = useEmitter(entry);
    let body = null;
    if (!entry.value) {
        body = <></>;
    } else {
        body = (
            <div data-version={version}>
                {maskString(entry.value, 1, MAX_STRING_VALUE_LENGTH)}
            </div>
        );
    }
    return (
        <td
            className="value"
            onClick={(e) => {
                entry.toggleMark();
                refresh();
                e.stopPropagation();
            }}
            title={maskString(entry.value, 1, MAX_STRING_VALUE_LENGTH)}
        >
            {body}
        </td>
    );
}

function StolenDataRow({
    entry,
    refresh,
}: {
    entry: StolenDataEntry;
    refresh: Function;
}) {
    const [version] = useEmitter(entry);
    return (
        <tr
            data-key={entry.id}
            data-version={version}
            className={`${entry.isMarked ? 'toggled' : 'untoggled'}`}
        >
            <td className="checkbox">
                <input
                    type="checkbox"
                    checked={entry.isMarked}
                    onChange={() => {
                        entry.toggleMark();
                        refresh();
                    }}
                />
            </td>
            <th
                title={`Nazwa: ${entry.name}\nŹródło: ${entry.source}`}
                onClick={() => {
                    entry.toggleMark();
                    refresh();
                }}
            >
                {entry.name}
            </th>
            <td className="icons">
                {entry.source === 'cookie' ? (
                    <span title="Dane przechowywane w Cookies">
                        <img
                            src="/assets/icons/cookie.svg"
                            height={16}
                            width={16}
                            className="cookie-data"
                        />
                    </span>
                ) : entry.request.hasCookie() ? (
                    <span
                        title="Wysłane w zapytaniu opatrzonym Cookies"
                        style={{ opacity: 0.25 }}
                    >
                        <img
                            src="/assets/icons/cookie.svg"
                            height={16}
                            width={16}
                            className="request-with-cookie"
                        />
                    </span>
                ) : null}
                {entry.exposesOrigin() ? (
                    <span title="Pokazuje część historii przeglądania">
                        <img
                            src="/assets/icons/warning.svg"
                            height={16}
                            width={16}
                            className="show-history-part"
                        />
                    </span>
                ) : entry.request.exposesOrigin() ? (
                    <span
                        title="Jest częścią zapytania, które ujawnia historię przeglądania"
                        style={{ opacity: 0.25 }}
                    >
                        <img
                            src="/assets/icons/warning.svg"
                            height={16}
                            width={16}
                            className="request-with-history-part"
                        />
                    </span>
                ) : null}
            </td>
            <StolenDataValue refresh={refresh} entry={entry} />
        </tr>
    );
}

export default function StolenDataCluster({
    origin,
    shorthost,
    minValueLength,
    refresh,
    cookiesOnly,
    cookiesOrOriginOnly,
}: {
    origin: string;
    shorthost: string;
    refreshToken: number;
    minValueLength: number;
    refresh: Function;
    cookiesOnly: boolean;
    cookiesOrOriginOnly: boolean;
}) {
    const cluster = getMemory().getClustersForOrigin(origin)[shorthost];
    const fullHosts = cluster.getFullHosts();

    return (
        <div className="stolen-data-cluster-container">
            <header className="domains-container">
                <a className="domain" href={'https://' + cluster.id}>
                    {cluster.id}
                </a>
                <div className="subdomains-container">
                    {fullHosts.map((host, index) => (
                        <a
                            className="subdomain"
                            key={host}
                            href={`https://${host}`}
                        >
                            {host}{' '}
                            {`${fullHosts.length - 1 !== index ? '· ' : ''}`}
                        </a>
                    ))}
                </div>
            </header>
            <section>
                <table>
                    <thead>
                        <tr>
                            <th className="table-header" colSpan={4}>
                                Znalezione ustawienia:
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {cluster
                            .calculateRepresentativeStolenData({
                                minValueLength,
                                cookiesOnly,
                                cookiesOrOriginOnly,
                            })
                            .map((entry) => (
                                <StolenDataRow
                                    refresh={refresh}
                                    {...{
                                        entry,
                                        key: entry.id,
                                    }}
                                />
                            ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}
