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

    getEmailContent() {
        const clusters = this.getRelatedClusters();
        const _ = (key: string) => v(key, this.answers.zaimek);
        return (
            <>
                <h2>Transfer danych osobowych poza Europejski Obszar Gospodarczy</h2>
                <p>
                    Państwa strona przetworzyła {_('moje')} dane osobowe poprzez przesłanie danych
                    do:
                </p>
                <ul>
                    {clusters.map((cluster) => (
                        <li key={cluster.id}>
                            Właściciela domeny <strong>{cluster.id}</strong>: (w zakresie:{' '}
                            {cluster.getDataTypeDescription('mojej')});
                        </li>
                    ))}
                </ul>
                <p>
                    Według {_('mojej')} najlepszej wiedzy, każdy z tych podmiotów utrzymuje swoje
                    serwery poza Europejskim Obszarem Gospodarczym. Zatem Państwa strona przesłała
                    {_('moje')} dane osobowe poza EOG. Jeżeli tak jest, to takie przetwarzanie
                    danych jest niezgodne z prawem, gdyż dane trafiają do krajów, które nie
                    gwarantują ochrony danych w stopniu, jakiego wymaga RODO, a tzw. „Tarcza
                    Prywatności” została unieważniona w 2020r. Zob.{' '}
                    <a href="https://panoptykon.org/noyb-skargi-schrems-ii">
                        artykuł Fundacji Panoptykon w tej sprawie
                    </a>
                    .
                </p>
                <p>
                    {_('Zwracam')} się zatem do Państwa z pytaniem:{' '}
                    <strong>
                        czy wyżej wymienione podmioty, którym Państwa strona ujawniła moje dane
                        osobowe, przechowują moje dane poza EOG?
                    </strong>
                </p>
            </>
        );
    }
}
