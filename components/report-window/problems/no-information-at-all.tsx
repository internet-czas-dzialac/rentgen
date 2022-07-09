import { ExplainerKey } from '../explainers';
import { v } from '../verbs';
import { Problem } from './problem';

export default class NoInformationAtAllProblem extends Problem {
    qualifies() {
        return this.answers.popup_type === 'none';
    }
    getEmailContent({ mode, tone }: { mode: 'email' | 'report'; tone: 'official' | 'polite' }) {
        const _ = (word: string) => v(word, this.answers.zaimek);
        return (
            <>
                <h2>Brak informacji na temat przetwarzania danych osobowych</h2>
                {mode == 'email' ? (
                    tone == 'official' ? (
                        <p>
                            {_('Moje')} dane osobowe zostały ujawnione podmiotom, które są
                            właścicielami domen:
                        </p>
                    ) : (
                        <p>
                            Państwa strona ujawnia dane użytkowników podmiotom, które są
                            właścicielami następujących domen:
                        </p>
                    )
                ) : (
                    <p>
                        Poprzez skrypty osadzone na stronie dane osobowe użytkownika końcowego są
                        przekazywane podmiotom, którzy są właścicielami następujacych domen:
                    </p>
                )}
                {this.getRangeDescription()}
                <p>
                    Na stronie brakuje jednak jakichkolwiek informacji o tym, jakie są cele
                    przetwarzania takich danych oraz jakie są podstawy prawne takiego przetwarzania.
                </p>
                {mode == 'email' ? (
                    <p>Zwracam się zatem do Państwa z następującymi pytaniami:</p>
                ) : (
                    <p>Na stronie należy zawrzeć odpowiedzi na następujące pytania:</p>
                )}
                <ul>
                    <li>Jaka jest tożsamość właścicieli tych domen?</li>
                    <li>Jaki jest cel takiego przetwarzania danych przez Państwa stronę?</li>
                    <li>
                        Jaka jest podstawa prawna takiego przetwarzania{' '}
                        {mode == 'email' ? _('moich') : ''} danych osobowych $
                        {mode == 'report' ? 'użytkowników końcowych' : ''} przez Państwa stronę?
                    </li>
                </ul>
            </>
        );
    }
    getNecessaryExplainers() {
        const explainers = [] as Array<ExplainerKey>;

        if (
            this.getMarkedClusters().some((cluster) => {
                return cluster.hasMarkedCookies();
            })
        ) {
            explainers.push('cookies_are_pii');
            explainers.push('responsibility_for_third_parties');
        }
        return explainers;
    }
}
