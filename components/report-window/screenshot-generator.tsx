import React, { Fragment } from 'react';
import { RequestCluster } from '../../request-cluster';
import './screenshot-generator.scss';

const SS_URL = 'http://65.108.60.135:3000';

enum taskState {
    WAITING = 'waiting',
    RUNNING = 'running',
    FINISHED = 'finished',
}

type Screenshot = {
    url: string;
    domain: string;
    filename: string;
    found_headers: string[];
};

interface screenshotTask {
    domains: string[];
    elapsed_time_s: number;
    finished_time: number;
    id: string;
    images: Screenshot[];
    jobs_ahead: number;
    output: string;
    processing_took: number;
    request_time: number;
    started_time: number;
    status: taskState;
    url: string;
    waiting_took: number;
    zip_url: string;
}

function createTaskEndpoint(visited_url: string, domains: string[]) {
    return `${SS_URL}/api/requests?url=${visited_url}${domains.reduce(
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
    setRequestPath,
    downloadFiles,
}: {
    visited_url: string;
    clusters: Record<string, RequestCluster>;
    setReportWindowMode: Function;
    setRequestPath: Function;
    downloadFiles: Function;
}) {
    const [mode, setMode] = React.useState<string>('idle');
    const [images, setImages] = React.useState<Screenshot[]>([]);
    const [taskId, setTaskId] = React.useState<string>(null);
    const [output, setOutput] = React.useState<any>({});

    async function subscribeTask(path: string): Promise<screenshotTask> {
        let response = { status: taskState.WAITING };
        while (response.status === taskState.WAITING || response.status === taskState.RUNNING) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            response = await (await pollTask(path)).json();
            setImages((response as screenshotTask)?.images);
            document.querySelector('.images').scrollTo({
                top: document.querySelector('.images').scrollHeight,
                behavior: 'smooth',
            });
        }

        if (response.status === taskState.FINISHED) {
            setMode('finished');
        }
        return response as screenshotTask;
    }

    return (
        <div className="generator-container">
            {mode === 'idle' ? (
                <Fragment>
                    <h1>Przygotowanie zrzutów ekranów</h1>
                    <div className="container">
                        <h2>Notka informacyjna</h2>
                        <p>
                            Dla potwierdzenia przechwyconych danych, warto załączyć zrzuty ekranów
                            narzędzi deweloperskich do maila dla administratora oraz Urzędu Ochrony
                            Danych Osobowych.
                        </p>
                        <p>
                            Jeżeli nie wiesz jak wykonać zrzuty ekranów, skorzystaj z{' '}
                            <a href="">naszej instrukcji</a> lub wtyczka Rentgen może wygenerować je
                            za Ciebie.
                        </p>
                    </div>

                    <div className="buttons-container">
                        <button
                            className="sv_prev_btn"
                            onClick={() => {
                                setReportWindowMode('preview');
                                setRequestPath(null);
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
                                setImages(response.images);
                                console.log('response.images', response.images);
                                console.log('output', response);

                                setOutput(response);
                                setRequestPath(response.zip_url);
                            }}
                        >
                            Wygeneruj
                        </button>
                    </div>
                </Fragment>
            ) : null}

            {mode === 'in_progress' || mode === 'finished' ? (
                <Fragment>
                    <h1>Przygotowanie zrzutów ekranów</h1>
                    <div className="container">
                        {mode === 'in_progress' ? (
                            <Fragment>
                                <h2>To może chwilkę zająć...</h2>
                                <p>
                                    Nasz serwer właśnie odwiedza wskazaną przez Ciebie stronę
                                    i przygotowuje zrzuty ekranów narzędzi deweloperskich.
                                </p>
                            </Fragment>
                        ) : null}
                        {mode === 'finished' ? (
                            <Fragment>
                                <h2>Gotowe!</h2>
                                <p>Zrzuty ekranów narzędzi deweloperskich są gotowe do pobrania.</p>
                            </Fragment>
                        ) : null}

                        <div className="images">
                            {images.map((screenshot) => {
                                return (
                                    <div
                                        key={`${taskId}_${screenshot.url}`}
                                        className="browser browser--filled"
                                        style={{
                                            backgroundImage: `url(${SS_URL}${screenshot.url})`,
                                        }}
                                    >
                                        <div className="browser__header">
                                            <div className="browser__header--address-bar">
                                                {screenshot.url.split('-').slice(-2).join('-')}
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
                    </div>
                    <div className="buttons-container">
                        {mode === 'finished' ? (
                            <Fragment>
                                <button
                                    className="sv_next_btn"
                                    onClick={() => {
                                        downloadFiles(`${SS_URL}${output.zip_url}`);
                                        setReportWindowMode('preview');
                                    }}
                                >
                                    Pobierz zrzuty ekranów i przejdź dalej
                                </button>
                            </Fragment>
                        ) : null}
                    </div>
                </Fragment>
            ) : null}
        </div>
    );
}
