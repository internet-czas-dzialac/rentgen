export type ExplainerKey = 'cookies_are_pii';

export const Explainers: Record<ExplainerKey, (zaimek_index: 0 | 1 | 2 | 3) => JSX.Element> = {
    cookies_are_pii: () => (
        <>
            <h2>Ciasteczka stanowią dane osobowe</h2>
            <p>
                Sztucznie wygenerowane identyfikatory przechowywane w plikach Cookies stanowią dane
                osobowe. Wskazuje na to wprost Art. 4. pkt 1. RODO, wymieniając „identyfikator
                internetowy” i „numer identyfikacyjny” jako przykłady danych osobowych.
            </p>
        </>
    ),
};
