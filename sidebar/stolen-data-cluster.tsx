import React, { Fragment } from 'react';
import { getMemory } from '../memory';
import { StolenDataEntry } from '../stolen-data-entry';

import { maskString, useEmitter } from '../util';
import CookieIcon from '../assets/icons/cookie.svg';
import WarningIcon from '../assets/icons/warning.svg';

import './stolen-data-cluster.scss';

const MAX_STRING_VALUE_LENGTH = 100;

function StolenDataValue({
    entry,
}: {
    entry: StolenDataEntry;
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
                e.stopPropagation();
            }}
            // style={{ color: entry.isMarked ? 'black' : 'gray' }}
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
                // className={`${entry.isMarked ? 'toggled' : 'untoggled'}`}
                title={'Źródło: ' + entry.source}
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
                        <CookieIcon
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
                        <CookieIcon
                            height={16}
                            width={16}
                            className="request-with-cookie"
                        />
                    </span>
                ) : null}
                {entry.exposesOrigin() ? (
                    <span title="Pokazuje część historii przeglądania">
                        <WarningIcon
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
                        <WarningIcon
                            height={16}
                            width={16}
                            className="request-with-history-part"
                        />
                    </span>
                ) : null}
            </td>
            {/* <td style={{ wordWrap: 'anywhere' as any }}> */}

            <StolenDataValue entry={entry} />
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

        // <div>
        //     <h2>
        //         <a href={'https://' + cluster.id}>{cluster.id}</a>{' '}
        //         {cluster.hasCookies() ? '🍪' : ''} x{cluster.requests.length}{' '}
        //         {/* <a
        //          *   href="#"
        //          *   style={{ fontSize: "10px" }}
        //          *   onClick={() => getMemory().removeCookiesFor(origin, shorthost)}
        //          * >
        //          *   Wyczyść cookiesy
        //          * </a> */}
        //         <a
        //             href="#"
        //             style={{ fontSize: '10px' }}
        //             onClick={(e) => {
        //                 cluster.autoMark();
        //                 refresh();
        //                 e.preventDefault();
        //             }}
        //         >
        //             Zaznacz auto
        //         </a>
        //     </h2>
        //     <div>
        //         {cluster.getFullHosts().map((host) => (
        //             <a key={host} href={`https://${host}`}>
        //                 {host},{' '}
        //             </a>
        //         ))}
        //     </div>
        //     <table>
        //         <tbody>
        //             {cluster
        //                 .calculateRepresentativeStolenData({
        //                     minValueLength,
        //                     cookiesOnly,
        //                     cookiesOrOriginOnly,
        //                 })
        //                 .map((entry) => (
        //                     <StolenDataRow
        //                         refresh={refresh}
        //                         {...{
        //                             entry,
        //                             key: entry.id,
        //                         }}
        //                     />
        //                 ))}
        //         </tbody>
        //     </table>
        // </div>
    );
}
