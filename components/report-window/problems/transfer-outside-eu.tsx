import { RequestCluster } from '../../../request-cluster';
import { ExplainerKey } from '../explainers';
import { v } from '../verbs';
import { Problem } from './problem';

export class TransferOutsideEU extends Problem {
    getNecessaryExplainers(): ExplainerKey[] {
        return [];
    }

    qualifies(): boolean {
        return Object.values(this.answers.hosts).some(
            (hostAnswers) => hostAnswers.outside_eu == 'yes'
        );
    }

    getRelatedClusters(): RequestCluster[] {
        return Object.entries(this.answers.hosts)
            .filter(([_, hostAnswers]) => hostAnswers.outside_eu == 'yes')
            .map(([id]) => this.clusters[id]);
    }

    getEmailContent(mode: 'email' | 'report') {
        const clusters = this.getRelatedClusters();
        const _ = (key: string) => v(key, this.answers.zaimek);
        return (
            <>
                <h2>Transfer danych osobowych poza Europejski Obszar Gospodarczy</h2>
                {mode == 'email' ? (
                    <p>
                        Państwa strona przetworzyła {_('moje')} dane osobowe poprzez przesłanie
                        danych do:
                    </p>
                ) : (
                    <p>
                        Strona przetwarza dane osobowe użytkowników końcowych poprzez przesłanie
                        przekazanie ich do:
                    </p>
                )}
                <ul>
                    {clusters.map((cluster) => (
                        <li key={cluster.id}>
                            właściciela domeny <strong>{cluster.id}</strong>: (w zakresie:{' '}
                            {cluster.getDataTypeDescription(mode == 'email' ? 'mojej' : '')});
                        </li>
                    ))}
                </ul>
                {mode == 'email' ? (
                    <p>
                        Według {_('mojej')} najlepszej wiedzy, każdy z tych podmiotów utrzymuje
                        swoje serwery poza Europejskim Obszarem Gospodarczym. Zatem Państwa strona
                        przesłała
                        {_('moje')} dane osobowe poza EOG. Jeżeli tak jest, to takie przetwarzanie
                        danych jest niezgodne z prawem, gdyż dane trafiają do krajów, które nie
                        gwarantują ochrony danych w stopniu, jakiego wymaga RODO, a tzw. „Tarcza
                        Prywatności” została unieważniona w 2020r. Zob.{' '}
                        <a href="https://panoptykon.org/noyb-skargi-schrems-ii">
                            artykuł Fundacji Panoptykon w tej sprawie
                        </a>
                        .
                    </p>
                ) : (
                    <p>
                        Te podmioty utrzymują swoje centra danych poza Europejskim Obszarem
                        Gospodarczym. Jako, że tzw. „Tarcza Prywatności” zostałą unieważniona w
                        2020r., nie można przesyłać danych osobowych obywateli Unii Europejskiej do
                        krajów, które nie zapewniają ochrony danych o sile odpowiadającej RODO.
                        Przykłądem kraju, do którego nie można przekazywać danych osobowych
                        obywateli UE są Stany Zjednoczone.
                    </p>
                )}
                {mode == 'email' ? (
                    <p>
                        {_('Zwracam')} się zatem do Państwa z pytaniem:{' '}
                        <strong>
                            czy wyżej wymienione podmioty, którym Państwa strona ujawniła moje dane
                            osobowe, przechowują moje dane poza EOG?
                        </strong>
                    </p>
                ) : (
                    <p>
                        Zaleca się rezygnację z korzystania z usług firm, które przetwarzają dane
                        osobowe użytkowników, a których centra danych znajdują się poza EOG.
                    </p>
                )}
            </>
        );
    }
}
