import React, { Fragment } from 'react';
import { RequestCluster } from '../../request-cluster';
import './screenshot-generator.scss';

function createTaskEndpoint(visited_url: string, domains: string[]) {
    return `http://65.108.60.135:3000/api/requests?url=${visited_url}${domains.reduce(
        (prev: string, curr: string) => prev + '&domains[]=' + curr,
        ''
    )}`;
}

function createTask(visited_url: string, domains: string[]) {
    return fetch(createTaskEndpoint(visited_url, domains), { method: 'POST' });
}

async function subscribe(path: string) {
    let request = await fetch(path, { method: 'GET' });
    const response = await request.json();

    if (response.status === 'running' || response.status === 'waiting') {
        console.debug(response.status);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        await subscribe(path);
    } else if (response.status === 'finished') {
        console.log('response', response);
        return response;
    }
}

export default function ScreenshotGenerator({
    visited_url,
    clusters,
}: {
    visited_url: string;
    clusters: Record<string, RequestCluster>;
}) {
    const [isLoading, setLoading] = React.useState<boolean>(false);
    const [output, setOutput] = React.useState<string[]>([]);

    return (
        <div className="generator-container">
            {!isLoading ? (
                <Fragment>
                    <h1>Przygotowanie zrzutów ekranów</h1>
                    <p>
                        Dla potwierdzenia przechwyconych danych, warto załączyć zrzuty ekranów
                        narzędzi deweloperskich do maila dla administratora oraz Urzędzu Ochrony
                        Danych Osobowych.
                    </p>
                    <p>
                        Jeżeli nie wiesz jak wykonać zrzuty ekranów, skorzystaj z{' '}
                        <a href="">naszej instrukcji</a> lub wtyczka Rentgen może wygenerować je za
                        Ciebie.
                    </p>

                    <button>Pomiń</button>
                    <button
                        onClick={async () => {
                            setLoading(true);
                            const task = await createTask(visited_url, Object.keys(clusters));
                            const response = await subscribe(task.url);

                            setOutput(response.files);
                            console.log('output', response);
                        }}
                    >
                        Wygeneruj
                    </button>
                </Fragment>
            ) : (
                <Fragment>
                    <h1>Przygotowujemy zrzuty ekranów</h1>

                    <pre>{createTaskEndpoint(visited_url, Object.keys(clusters))}</pre>

                    {JSON.stringify(output)}
                    <button>In progress</button>
                </Fragment>
            )}
        </div>
    );
}
