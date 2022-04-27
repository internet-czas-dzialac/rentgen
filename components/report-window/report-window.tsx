import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { getMemory } from '../../memory';
import { useEmitter } from '../../util';

import './report-window.scss';
import Questions from './questions';
import EmailContent from './email-content';
import { parseAnswers, ParsedAnswers } from './parse-answers';

interface Host {
    [name: string]: boolean;
}

function Report() {
    const [hosts, setHosts] = React.useState<Host>({});
    const [surveyMode, setSurveyMode] = React.useState<boolean>(false);

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
            setHosts(
                Object.fromEntries(
                    Object.values(clusters)
                        .filter((cluster) => cluster.getMarkedRequests().length > 0)
                        .map((cluster) => [cluster.id, true])
                )
            );
        }, [mode, answers, origin]);

        const visited_url = Object.values(clusters)
            .find((cluster) => cluster.getMarkedRequests().length > 0)
            ?.getMarkedRequests()[0].originalURL;

        const result = (
            <div {...{ 'data-version': counter }}>
                {mode === 'survey' ? (
                    <Questions
                        // hosts={Object.values(clusters)
                        //     .filter((cluster) => cluster.getMarkedRequests().length > 0)
                        //     .map((cluster) => cluster.id)}
                        hosts={Object.entries(hosts)
                            .filter((host) => host[1])
                            .map((host) => host[0])}
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

        function markHost(name: string) {
            const clone_hosts = Object.assign({}, hosts);
            clone_hosts[name] = !clone_hosts[name];
            setHosts(clone_hosts);
            console.log(hosts);
        }

        return (
            <div>
                <header className="header">
                    <img src="../../assets/icon-addon.svg" height={32}></img>
                    <div className="webpage-metadata">
                        <span>Generowanie raportu </span>
                        <span className="webpage-metadata--hyperlink">{origin}</span>
                    </div>
                </header>
                {surveyMode ? (
                    <section>{result}</section>
                ) : (
                    <section>
                        Wybór hostów
                        <ul>
                            {
                                //     Object.values(clusters)
                                // .filter((cluster) => cluster.getMarkedRequests().length > 0)
                                // .map((cluster) => cluster.id)

                                Object.keys(hosts).map((host) => {
                                    return (
                                        <li key={host}>
                                            <label htmlFor={host} onClick={() => markHost(host)}>
                                                <input
                                                    name={host}
                                                    type="checkbox"
                                                    // onChange={() => markHost(host)}
                                                    readOnly={true}
                                                    checked={hosts[host]}
                                                ></input>
                                                {host}
                                            </label>
                                        </li>
                                    );
                                })
                            }

                            {/*  */}
                        </ul>
                        <button onClick={() => setSurveyMode(true)}>Zatwierdź</button>
                    </section>
                )}
            </div>
        );
    } catch (e) {
        console.error(e);
        return <div>ERROR! {JSON.stringify(e)}</div>;
    }
}

ReactDOM.render(<Report />, document.getElementById('app'));
