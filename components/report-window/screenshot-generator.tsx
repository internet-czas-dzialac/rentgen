import React, { Fragment } from 'react';
import { RequestCluster } from '../../request-cluster';
import './screenshot-generator.scss';

enum taskState {
    WAITING = 'waiting',
    RUNNING = 'running',
    FINISHED = 'finished',
}

interface screenshotTask {
    url: string;
    domains: string[];
    id: string;
    status: taskState;
    output: string;
    files: string[];
}

function createTaskEndpoint(visited_url: string, domains: string[]) {
    return `http://65.108.60.135:3000/api/requests?url=${visited_url}${domains.reduce(
        (prev: string, curr: string) => prev + '&domains[]=' + curr,
        ''
    )}`;
}

function createTask(visited_url: string, domains: string[]) {
    return fetch(createTaskEndpoint(visited_url, domains), { method: 'POST' });
}

function pollTask(path: string): Promise<Response> {
    return fetch(path, { method: 'GET' });
}

export default function ScreenshotGenerator({
    visited_url,
    clusters,
    setReportWindowMode,
}: {
    visited_url: string;
    clusters: Record<string, RequestCluster>;
    setReportWindowMode: Function;
}) {
    const [mode, setMode] = React.useState<string>('idle');
    const [images, setImages] = React.useState<string[]>([]);
    const [taskId, setTaskId] = React.useState<string>(null);

    async function subscribeTask(path: string): Promise<screenshotTask> {
        let response = { status: taskState.WAITING };
        while (response.status === taskState.WAITING || response.status === taskState.RUNNING) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            response = await (await pollTask(path)).json();
            setImages((response as screenshotTask)?.files);
        }

        if (response.status === taskState.FINISHED) {
            setMode('finished');
        }
        return response as screenshotTask;
    }

    function downloadFiles() {
        const urls = images.map((el) => `http://65.108.60.135:3000/static/${taskId}/${el}`);

        for (const url of urls) {
            let a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('download', '');
            a.setAttribute('target', '_blank');
            a.click();
        }
        setReportWindowMode('preview');
    }

    return (
        <div className="generator-container">
            {mode === 'idle' ? (
                <Fragment>
                    <h1>Przygotowanie zrzutów ekranów</h1>
                    <p>
                        Dla potwierdzenia przechwyconych danych, warto załączyć zrzuty ekranów
                        narzędzi deweloperskich do maila dla administratora oraz Urzędu Ochrony
                        Danych Osobowych.
                    </p>
                    <p>
                        Jeżeli nie wiesz jak wykonać zrzuty ekranów, skorzystaj z{' '}
                        <a href="">naszej instrukcji</a> lub wtyczka Rentgen może wygenerować je za
                        Ciebie.
                    </p>

                    <button
                        className="sv_prev_btn"
                        onClick={() => {
                            setReportWindowMode('preview');
                        }}
                    >
                        Pomiń
                    </button>
                    <button
                        className="sv_next_btn"
                        onClick={async () => {
                            setMode('in_progress');
                            const task = await createTask(visited_url, Object.keys(clusters));
                            const urlArr = task.url.split('/');
                            setTaskId(urlArr[urlArr.length - 1]);
                            const response = await subscribeTask(task.url);
                            setImages(response.files);
                            console.log('output', response);
                        }}
                    >
                        Wygeneruj
                    </button>
                </Fragment>
            ) : null}

            {mode === 'in_progress' || mode === 'finished' ? (
                <Fragment>
                    <h1>Przygotowujemy zrzuty ekranów</h1>
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore sint
                        laudantium blanditiis aperiam quos expedita voluptatem iure, nam aliquam vel
                        minus aliquid incidunt consequatur illo velit dolorem error exercitationem
                        tempora?
                    </p>

                    <div className="images">
                        {images.map((filename: string) => {
                            return (
                                <div
                                    key={`${taskId}_${filename}`}
                                    className="browser browser--filled"
                                    style={{
                                        backgroundImage: `url(http://65.108.60.135:3000/static/${taskId}/${filename})`,
                                    }}
                                >
                                    <div className="browser__header">
                                        <div className="browser__header--address-bar">
                                            {filename}
                                        </div>
                                        <div className="browser__header--controls">· · ·</div>
                                    </div>
                                    <div className="browser__content"></div>
                                </div>
                            );
                        })}

                        {mode === 'in_progress' ? (
                            <div className="browser">
                                <div className="browser__header">
                                    <div className="browser__header--address-bar"></div>
                                    <div className="browser__header--controls">· · ·</div>
                                </div>
                                <div className="browser__content"></div>
                            </div>
                        ) : null}
                    </div>
                    {mode === 'finished' ? (
                        <button className="sv_next_btn" onClick={() => downloadFiles()}>
                            Pobierz zrzuty ekranów
                        </button>
                    ) : null}
                </Fragment>
            ) : null}
        </div>
    );
}
