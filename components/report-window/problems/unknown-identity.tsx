import { RequestCluster } from '../../../request-cluster';
import { ExplainerKey } from '../explainers';
import { ParsedHostAnswers } from '../parse-answers';
import { v } from '../verbs';
import { Problem } from './problem';

export class UnknownIdentity extends Problem {
    getNecessaryExplainers(): ExplainerKey[] {
        return ['responsibility_for_third_parties'];
    }

    qualifies(): boolean {
        return this.answers.administrator_identity_available_before_choice == 'no';
    }

    getEmailContent(mode: 'email' | 'report', tone: 'polite' | 'official') {
        const _ = (key: string) => v(key, this.answers.zaimek);
        return (
            <>
                <h2>Tożsamość administratora</h2>
                {mode == 'email' ? (
                    <p>
                        Na Państwa stronie nie {_('znalazłem')} informacji o tym, kto jest
                        administratorem moich danych osobowych przetwarzanych przez Państwa stronę w
                        trakcie {_('moich')} odwiedzin.
                    </p>
                ) : (
                    <p>
                        Na stronie brakuje informacji o tym, kto jest administratorem danych
                        osobowych osób ją odwiedzających.
                    </p>
                )}
                <p>
                    Zgodnie z treścią Art. 13 RODO, jeżeli dane osobowe osoby, której dane dotyczą,
                    zbierane są od tej osoby, administrator podczas pozyskiwania danych osobowych
                    musi podać jej swoją tożsamość i dane kontaktowe.
                </p>
                {mode == 'email' ? (
                    tone == 'official' ? (
                        <p>
                            Zwracam się zatem z pytaniem:{' '}
                            <strong>jaka jest tożsamość administratora tej strony?</strong>
                        </p>
                    ) : (
                        <p>
                            Apeluję o dodanie do Państwa strony informacji o tym, kto (np. pełna
                            nazwa firmy + NIP oraz dane kontaktowe) jest administratorem danych
                            osobowych przetwarzanych przez tę stronę.
                        </p>
                    )
                ) : (
                    <p>
                        Zalecane jest dodanie informacji o administratorze strony (pełna nazwa firmy
                        + NIP i dane kontaktowe) w łatwo dostępnym miejscu na stronie.
                    </p>
                )}
            </>
        );
    }
}
