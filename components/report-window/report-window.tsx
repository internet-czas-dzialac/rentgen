import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { getMemory } from '../../memory';
import { useEmitter } from '../../util';

import './report-window.scss';
import Questions from './questions';
import EmailContent from './email-content';
import { parseAnswers, ParsedAnswers } from './parse-answers';
import ScreenshotGenerator from './screenshot-generator';

function downloadFiles(link: string) {
    let a = document.createElement('a');
    a.setAttribute('href', link);
    a.setAttribute('download', '');
    a.setAttribute('target', '_blank');
    a.click();
}

function Report() {
    try {
        const url = new URL(document.location.toString());
        const origin = url.searchParams.get('origin');
        if (!origin) {
            return <div>Błąd: brak parametru "origin"</div>;
        }
        const [counter] = useEmitter(getMemory());
        const rawAnswers = url.searchParams.get('answers');
        const [answers, setAnswers] = React.useState<ParsedAnswers>(
            rawAnswers ? JSON.parse(rawAnswers) : null
        );
        const [mode, setMode] = React.useState(url.searchParams.get('mode') || 'survey');
        const [scrRequestPath, setScrRequestPath] = React.useState('');

        const clusters = getMemory().getClustersForOrigin(origin || '');

        React.useEffect(() => {
            if (!origin) return;
            const url = new URL(document.location.toString());
            url.searchParams.set('origin', origin);
            url.searchParams.set('answers', JSON.stringify(answers));
            url.searchParams.set('mode', mode);
            history.pushState({}, 'Rentgen', url.toString());
        }, [mode, answers, origin]);
        const visited_url = Object.values(clusters)
            .sort((a, b) => (a.lastModified > b.lastModified ? -1 : 1))
            .find((cluster) => !!cluster.lastFullUrl)?.lastFullUrl;

        if (!visited_url) {
            return <div>Wczytywanie...</div>;
        }

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
                        {...{
                            visited_url,
                            clusters,
                            setReportWindowMode: setMode,
                            setRequestPath: setScrRequestPath,
                            downloadFiles: downloadFiles,
                            user_role: answers.user_role,
                        }}
                    />
                ) : (
                    ''
                )}
                {mode === 'preview' ? (
                    <EmailContent
                        {...{
                            answers,
                            visited_url,
                            clusters,
                            scrRequestPath,
                            downloadFiles: downloadFiles,
                            user_role: answers.user_role,
                        }}
                    />
                ) : (
                    ''
                )}
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
