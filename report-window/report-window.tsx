import React from 'react';
import ReactDOM from 'react-dom';
import { getMemory } from '../memory';
import { useEmitter } from '../util';

import './report-window.scss';
import Questions from './questions';
import EmailContent from './email-content';
import { parseAnswers, ParsedAnswers } from './parse-answers';

function Report() {
    try {
        const origin = new URL(document.location.toString()).searchParams.get('origin');
        const [counter] = useEmitter(getMemory());
        const [answers, setAnswers] = React.useState<ParsedAnswers>(null);
        const [mode, setMode] = React.useState('survey');
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
        const result = (
            <div {...{ 'data-version': counter }}>
                <nav>
                    <img src="../assets/icon-addon.svg" width={48} height={48}></img>{' '}
                    <h1>Rentgen - Generuj treść maila dla {origin}</h1>
                </nav>
                {mode === 'survey' ? (
                    <Questions
                        hosts={Object.keys(clusters)}
                        onComplete={(answers) => {
                            setAnswers(parseAnswers(answers));
                            setMode('preview');
                        }}
                    ></Questions>
                ) : (
                    ''
                )}
                {mode === 'preview' ? <EmailContent {...{ answers }} /> : ''}
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
