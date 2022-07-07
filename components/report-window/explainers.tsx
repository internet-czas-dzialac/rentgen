// various explainers that could be related to multiple problems. They are gathered here and added at the end of the email to avoid pasting them multiple times

export type ExplainerKey = 'cookies_are_pii' | 'responsibility_for_third_parties';

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
    responsibility_for_third_parties: () => (
        <>
            <h2>Administrator strony ponosi odpowiedzialność za skrypty podmiotów trzecich</h2>
            <p>
                W wypadku, gdy ujawnienie czy dostęp do danych osobowych zostało dokonane przez
                skrypty podmiotów trzecich (np. Google, Facebook, itp), których autorem nie jest
                Administrator strony, Administrator wciąż jest odpowiedzialny za procesy
                przetwarzania danych osobowych, jakie realizują te skrypty&mdash;w myśl treści{' '}
                <a href="https://curia.europa.eu/juris/document/document.jsf?text=&docid=216555&pageIndex=0&doclang=PL&mode=lst&dir=&occ=first&part=1&cid=1254905">
                    wyroku TSUE w sprawie C-40/17
                </a>
            </p>
        </>
    ),
};
