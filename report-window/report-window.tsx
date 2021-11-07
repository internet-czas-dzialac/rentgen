import React, { useState } from "react";
import ReactDOM from "react-dom";
import { getMemory } from "../memory";
import { RequestCluster } from "../request-cluster";
import { Classifications, Sources } from "../stolen-data-entry";
import { getDate } from "../util";

const emailClassifications: Record<keyof typeof Classifications, string> = {
  id: "sztucznie nadane mi ID",
  history: "część mojej historii przeglądania",
};

const emailSources: Record<Sources, string> = {
  header: "w nagłówku HTTP",
  cookie: "z pliku Cookie",
  pathname: "jako części adresu URL",
  queryparams: "jako część adresu URL (query-params)",
};

type PopupState = "not_clicked" | "clicked_but_invalid";

function DomainSummary({ cluster }: { cluster: RequestCluster }) {
  return (
    <li>
      Właściciel domeny <strong>{cluster.id}</strong> otrzymał:{" "}
      <ul>
        {cluster
          .getMarkedEntries()
          .sort((entryA, entryB) => (entryA.value > entryB.value ? -1 : 1))
          .reduce((acc, entry, index, arr) => {
            if (index === 0) {
              return [entry];
            }
            if (entry.value != arr[index - 1].value) {
              acc.push(entry);
            }
            return acc;
          }, [])
          .map((entry) => (
            <li>
              {emailClassifications[entry.classification]}{" "}
              {emailSources[entry.source]}
              &nbsp;(<code>{entry.name.trim()}</code>)
            </li>
          ))}
      </ul>
    </li>
  );
}

function Report() {
  const [popupState, setPopupState] = useState<PopupState>("not_clicked");
  const origin = new URL(document.location.toString()).searchParams.get(
    "origin"
  );
  const clusters = getMemory().getClustersForOrigin(origin);
  const marked_entries = Object.values(clusters)
    .map((cluster) => cluster.getMarkedRequests())
    .reduce((a, b) => a.concat(b), [])
    .map((request) => request.getMarkedEntries())
    .reduce((a, b) => a.concat(b), []);
  return (
    <div>
      <h1>Generuj treść maila dla {origin}</h1>
      <table>
        <thead>
          <tr>
            <th>Adres docelowy</th>
            <th>Źródło danych</th>
            <th>Treść danych</th>
            <th>Klasyfikacja</th>
          </tr>
        </thead>
        <tbody>
          {marked_entries.map((entry) => (
            <tr
              style={{
                backgroundColor:
                  entry.classification == "id" ? "yellow" : "white",
              }}
            >
              <td>{entry.request.shorthost}</td>
              <td style={{ overflowWrap: "anywhere" }}>
                {entry.source}:{entry.name}
                {entry.markedKeys.join(",")}
              </td>
              <td
                style={{
                  width: "400px",
                  overflowWrap: "anywhere",
                  backgroundColor: entry.isRelatedToID()
                    ? "#ffff0054"
                    : "white",
                }}
              >
                {entry.value}
              </td>
              <td>
                <select value={entry.classification}>
                  {[
                    ["history", "Historia przeglądania"],
                    ["id", "Sztucznie nadane id"],
                  ].map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <label htmlFor="popupState">Status okienka o rodo:</label>
      <select
        id="popupState"
        value={popupState}
        onChange={(e) => setPopupState(e.target.value as PopupState)}
      >
        <option value="not_clicked">Nic nie kliknięte</option>
        <option value="clicked_but_invalid">Kliknięte, ale nieważne</option>
      </select>
      <div>
        <p>
          Dzień dobry, w dniu {getDate()} odwiedziłem stronę{" "}
          {marked_entries[0].request.originalURL}. Strona ta wysłała moje dane
          osobowe do podmiotów trzecich - bez mojej zgody.{" "}
        </p>
        <ul>
          {Object.values(clusters)
            .filter((cluster) => cluster.hasMarks())
            .map((cluster) => (
              <DomainSummary cluster={cluster} />
            ))}
        </ul>
        {popupState === "not_clicked" ? (
          <p>
            Dane te zostały wysłane przez Państwa stronę zanim zdążyłem w ogóle
            przeczytać treść wyskakującego okienka ze zgodami.
          </p>
        ) : null}
        <p>
          Nie widzę zatem przesłanki legalizującej takie przetwarzanie moich
          danych osobowych (na pewno nie jest to przetwarzanie konieczne do
          wyświetlenia strony z technicznego punktu widzenia). Jeżeli takie
          przesłanki legalizujące jednak występują, proszę o ich wskazanie,
          <strong> dla każdego z celów i podmiotów z osobna</strong>.
        </p>
        <p>
          Jeżeli wskazaną przez Państwa przesłanką legalizującą dany element
          procesu przetwarzania danych osobowych przez Państwa stronę jest Art
          6. pkt 1 lit. a) RODO (zgoda), na mocy Art. 7 pkt 1 RODO proszę o
          wykazanie, że udzieliłem Państwu zgodę na takie przetwarzanie moich
          danych osobowych zanim to przetwarzanie nastąpiło, oraz że ta zgoda
          jest ważna w świetle RODO (odnosząc się w szczególności do art. 7 ust.
          3 RODO). Z góry zaznaczam, że „ustawienia przeglądarki” nie stanowią
          ważnej w świetle RODO zgody.
        </p>
        <p>
          Jeżeli wskazaną przez Państwa przesłanką legalizującą dany element
          procesu przetwarzania danych osobowych przez Państwa stronę jest Art
          6. pkt 1 lit. b) RODO (niezbędność takiego przetwarzania do wykonania
          umowy), proszę o wskazanie, w jaki sposób ta konieczność zachodzi,
          oraz co sprawia, że Państwa zdaniem nie można wykonać umowy związanej
          z wyświetleniem Państwa strony bez przekazywania sztucznie nadanego ID
          w plikach Cookies lub historii przeglądania w nagłówku Referer do
          wskazanych podmiotów trzecich.
        </p>
        <p>
          Jeżeli wskazaną przez Państwa przesłanką legalizującą dany element
          procesu przetwarzania danych osobowych przez Państwa stronę jest Art
          6. pkt 1 lit. f) RODO (uzasadniony interes), proszę o wskazanie, jaki
          to jest <strong>konkretny interes</strong> (prosze o bardziej dokładny
          opis niż np. tylko "marketing"), oraz o wynik testu równowagi pomiędzy
          Państwa interesem a moimi podstawowymi wolnościami i prawami - ze
          wskazaniem tego, co sprawia, że w Państwa ocenie Państwa uzasadniony
          interes przeważa moje prawa i interesy w kontekście wspomnianych
          powyżej procesów przetwarzania danych.
        </p>
        <p>
          Niniejszym zwracam się także z żądaniem wycofania przesłanych przez
          Państwa stronę moich danych osobowych z baz wyżej wymienionych
          podmiotów oraz przesłania potwierdzenia uwiarygadniającego pomyślne
          wycofanie tych danych. Proszę też o przesłanie tożsamości podmiotów,
          które są właścicielami wyżej wymienionych domen, abym mógł zapoznać
          się z ich politykami prywatności.
        </p>
        <p>
          Proszę też o wysłanie kopii danych zebranych na mój temat i wysłanych
          do wyżej wymienionych podmiotów.
        </p>
        <p>
          W odpowiedzi proszę się nie powoływać na IAB Europe i ich rzekomą
          renomę w tworzeniu rozwiązań zgodnych z RODO. IAB chroni interes
          reklamodawców, a nie Użytkowników i ich rozwiązania (np. TCF) są
          notorycznie niezgodne z RODO i pozbawione szacunku dla Użytkowników.
        </p>
        <p>
          Apeluję także o wprowadzenie stosownych zmian na stronie tak, aby nie
          pozostawiać cienia wątpliwości odnośnie tego, na mocy jakiej
          przesłanki legalizującej dane są przetwarzane przez wspomniane
          podmioty trzecie, lub tak, aby te dane po prostu nie były wysyłane.
          Pomoże to zachować prywatność innym użytkownikom Państwa strony.
          Polecam Państwa uwadze oficjalne wytyczne EROD dotyczące zgody w
          kontekście RODO:
          https://edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_202005_consent_pl.pdf
          ). Aby na przykład zapobiec automatycznemu wysyłaniu historii
          przeglądania do podmiotów trzecich przez Państwa stronę, można po
          prostu ustawić odpowiednio treść nagłówka{" "}
          <a href="https://developer.mozilla.org/pl/docs/Web/HTTP/Headers/Referrer-Policy">
            Referrer-Policy{" "}
          </a>
          .
        </p>
      </div>
    </div>
  );
}

ReactDOM.render(<Report />, document.getElementById("app"));
