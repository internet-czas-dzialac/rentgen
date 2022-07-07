import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { getMemory } from '../../memory';
import { useEmitter } from '../../util';

import './report-window.scss';
import Questions from './questions';
import EmailContent from './email-content';
import { parseAnswers, ParsedAnswers } from './parse-answers';
import ScreenshotGenerator from './screenshot-generator';

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
                {mode === 'survey' ? (
                    <Questions
                        clusters={Object.values(clusters).filter(
                            (cluster) => cluster.getMarkedRequests().length > 0
                        )}
                        onComplete={(answers) => {
                            setAnswers(parseAnswers(answers));
                            setMode('screenshots');
                        }}
                    ></Questions>
                ) : (
                    ''
                )}
                {mode === 'screenshots' ? (
                    <ScreenshotGenerator
                        {...{ visited_url, clusters, setReportWindowMode: setMode }}
                    />
                ) : (
                    ''
                )}
                {mode === 'preview' ? <EmailContent {...{ answers, visited_url, clusters }} /> : ''}
                {/* <HARConverter {...{ entries }} /> */}
            </div>
        );
        return (
            <Fragment>
                <header className="header">
                    <img src="../../assets/icon-addon.svg" height={32}></img>
                    <div className="webpage-metadata">
                        {origin ? (
                            <>
                                <span>Generowanie raportu </span>
                                <span className="webpage-metadata--hyperlink">{origin}</span>
                            </>
                        ) : (
                            <span>Przejdź do wybranej strony internetowej</span>
                        )}
                    </div>
                </header>
                <section>{result}</section>
            </Fragment>
        );
    } catch (e) {
        console.error(e);
        return <div>ERROR! {JSON.stringify(e)}</div>;
    }
}

ReactDOM.render(<Report />, document.getElementById('app'));
