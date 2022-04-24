import React from 'react';
import ReactDOM from 'react-dom';
import { getMemory } from '../../memory';
import { useEmitter } from '../../util';

import './report-window.scss';
import Questions from './questions';
import EmailContent from './email-content';
import { parseAnswers, ParsedAnswers } from './parse-answers';

function Report() {
    try {
        const url = new URL(document.location.toString());
        const origin = url.searchParams.get('origin');
        const [counter] = useEmitter(getMemory());
        const [answers, setAnswers] = React.useState<ParsedAnswers>(
            url.searchParams.get('answers') ? JSON.parse(url.searchParams.get('answers')) : null
        );
        const [mode, setMode] = React.useState(url.searchParams.get('mode') || 'survey');
        const clusters = getMemory().getClustersForOrigin(origin);
        /* const [entries, setEntries] = React.useState<StolenDataEntry[]>([]); */
        /* React.useEffect(() => {
         *     setEntries(
         *         Object.values(clusters)
         *             .map((cluster) => {
         *                 cluster.calculateRepresentativeStolenData();
         *                 return cluster.representativeStolenData;
         *             })
         *             .reduce(reduceConcat, [])
         *             .filter((entry) => entry.isMarked)
         *     );
         * }, []); */
        /* if (entries.length == 0) {
         *     return <>Wczytywanie...</>;
         * } */

        React.useEffect(() => {
            const url = new URL(document.location.toString());
            url.searchParams.set('origin', origin);
            url.searchParams.set('answers', JSON.stringify(answers));
            url.searchParams.set('mode', mode);
            history.pushState({}, 'Rentgen', url.toString());
        }, [mode, answers, origin]);
        const visited_url = Object.values(clusters)
            .find((cluster) => cluster.getMarkedRequests().length > 0)
            ?.getMarkedRequests()[0].originalURL;

        const result = (
            <div {...{ 'data-version': counter }}>
                <nav>
                    <img src="../assets/icon-addon.svg" width={48} height={48}></img>{' '}
                    <h1>Rentgen - Generuj treść maila dla {origin}</h1>
                </nav>
                {mode === 'survey' ? (
                    <Questions
                        hosts={Object.values(clusters)
                            .filter((cluster) => cluster.getMarkedRequests().length > 0)
                            .map((cluster) => cluster.id)}
                        onComplete={(answers) => {
                            setAnswers(parseAnswers(answers));
                            setMode('preview');
                        }}
                    ></Questions>
                ) : (
                    ''
                )}
                {mode === 'preview' ? <EmailContent {...{ answers, visited_url, clusters }} /> : ''}
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
