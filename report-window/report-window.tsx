import React from 'react';
import ReactDOM from 'react-dom';
import { getMemory } from '../memory';
import { StolenDataEntry } from '../stolen-data-entry';
import { reduceConcat, useEmitter } from '../util';
import EmailTemplate from './email-template';

import './report-window.scss';

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
