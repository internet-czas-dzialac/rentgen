import React from 'react';
import ReactDOM from 'react-dom';
import { getMemory } from '../memory';
import { Classifications, StolenDataEntry } from '../stolen-data-entry';
import { reduceConcat, useEmitter } from '../util';
import EmailTemplate from './email-template';
import HARConverter from './har-converter';

import './report-window.scss';

function DataPreview({ entries, refresh }: { entries: StolenDataEntry[]; refresh: () => void }) {
    // currently not used, maybe scraped entirely in the future
    return (
        <table>
            <thead>
                <tr>
                    <th>Adres docelowy</th>
                    <th>Źródło danych</th>
                    <th>Treść danych</th>
                    <th>Klasyfikacja</th>
                </tr>
            </thead>
            <tbody>
                {entries.map((entry) => (
                    <tr
                        key={entry.id}
                        style={{
                            backgroundColor: entry.classification == 'id' ? 'yellow' : 'white',
                        }}
                    >
                        <td>{entry.request.shorthost}</td>
                        <td style={{ overflowWrap: 'anywhere' }}>
                            {entry.source}:{entry.name}
                        </td>
                        <td
                            style={{
                                width: '400px',
                                overflowWrap: 'anywhere',
                                backgroundColor: entry.isRelatedToID() ? '#ffff0054' : 'white',
                            }}
                        >
                            {entry.getValuePreview()}
                            {/* always gonna have
                one key, because unwrapEntry is called above */}
                        </td>
                        <td>
                            <select
                                value={entry.classification}
                                onChange={(e) => {
                                    entry.classification = e.target
                                        .value as keyof typeof Classifications;
                                    refresh();
                                }}
                            >
                                {[
                                    ['history', 'Historia przeglądania'],
                                    ['id', 'Identyfikator internetowy'],
                                    ['location', 'Lokalizacja'],
                                ].map(([key, name]) => (
                                    <option key={key} value={key}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function Report() {
    try {
        const origin = new URL(document.location.toString()).searchParams.get('origin');
        const [counter, setCounter] = useEmitter(getMemory());
        const clusters = getMemory().getClustersForOrigin(origin);
        const [entries, setEntries] = React.useState<StolenDataEntry[]>([]);
        React.useEffect(() => {
            setEntries(
                Object.values(clusters)
                    .map((cluster) => {
                        cluster.calculateRepresentativeStolenData();
                        return cluster.representativeStolenData;
                    })
                    .reduce(reduceConcat, [])
                    .filter((entry) => entry.isMarked)
            );
        }, []);
        if (entries.length == 0) {
            return <>Wczytywanie...</>;
        }
        const result = (
            <div {...{ 'data-version': counter }}>
                <nav>
                    <img src="../assets/icon-addon.svg" width={48} height={48}></img>{' '}
                    <h1>Rentgen - Generuj treść maila dla {origin}</h1>
                </nav>

                <EmailTemplate {...{ entries, clusters, version: counter }} />
                {/* <HARConverter {...{ entries }} /> */}
            </div>
        );
        return result;
    } catch (e) {
        console.error(e);
        return <div>ERROR! {JSON.stringify(e)}</div>;
    }
}

ReactDOM.render(<Report />, document.getElementById('app'));
