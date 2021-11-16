import React, { useState } from "react";
import { RequestCluster } from "../request-cluster";
import { StolenDataEntry } from "../stolen-data-entry";
import { getDate, toBase64 } from "../util";
import DomainSummary from "./domain-summary";

type PopupState = "not_clicked" | "clicked_but_invalid";

export default function EmailTemplate({
  marked_entries,
  clusters,
}: {
  marked_entries: StolenDataEntry[];
  clusters: Record<string, RequestCluster>;
}): JSX.Element {
  const [popupState, setPopupState] = useState<PopupState>("not_clicked");
  const [acceptAllName, setAcceptAllName] = useState<string>(
    "Zaakceptuj wszystkie"
  );
  const [popupScreenshotBase64, setPopupScreenshotBase64] =
    useState<string>(null);

  return (
    <div>
      <label htmlFor="popupState">Status okienka o rodo:</label>
      <select
        id="popupState"
        value={popupState}
        onChange={(e) => setPopupState(e.target.value as PopupState)}
      >
        <option value="not_clicked">Nic nie kliknięte</option>
        <option value="clicked_but_invalid">Kliknięte, ale nieważne</option>
      </select>
      {popupState === "clicked_but_invalid" ? (
        <>
          <div>
            <label htmlFor="acceptAllName">
              Tekst na przycisku do zatwierdzania wszystkich zgód:
            </label>
            <input
              {...{
                type: "text",
                value: acceptAllName,
                onChange: (e) => setAcceptAllName(e.target.value),
              }}
            />
          </div>
          <div>
            <label htmlFor="popup-screenshot">
              Zrzut ekranu z tego, jak wyglądał popup przed kliknięciem „
              {acceptAllName}”:
            </label>
            <input
              {...{
                type: "file",
                id: "popup-screenshot",
                onChange: async (e) => {
                  setPopupScreenshotBase64(await toBase64(e.target.files[0]));
                },
              }}
            />
          </div>
        </>
      ) : null}
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
      <p>
        {" "}
        Dane te zostały wysłane przez Państwa stronę - a mówiąc dokładniej,
        przez zamieszczone przez Państwa na tej stronie skrypty.
      </p>
      {popupState === "not_clicked" ? (
        <p>
          Nastąpiło to, zanim zdążyłem w ogóle przeczytać treść wyskakującego
          okienka ze zgodami.
        </p>
      ) : null}
      {popupState === "clicked_but_invalid" ? (
        <p>
          O ile po wejściu na stronę wcisnąłem w wyskakującym okienku przycisk „
          {acceptAllName}”, o tyle nie stanowi to według mnie ważnej w świetle
          RODO zgody, gdyż brakowało w tym okienku równie łatwo osiągalnego
          przycisku, którego kliknięcie skutkowałoby zasygnalizowaniem braku
          mojej zgody na takie przetwarzanie moich danych. Mówiąc wprost -
          wyrażenie „zgody” było łatwiejsze niż jej niewyrażenie. Zatem tak
          otrzymana przez Państwo moja „zgoda” nie jest poprawną podstawą prawną
          do przetwarzania moich danych osobowych (
          <em>
            art. 7 ust. 3 Rozporządzenia Parlamentu Europejskiego i Rady (UE)
            2016/679 z dnia 27 kwietnia 2016
          </em>
          ).
          {<img {...{ src: popupScreenshotBase64 }} />}
        </p>
      ) : null}
      <p>
        Udokumentowałem to na zrzutach ekranu z mojej przeglądarki internetowej,
        które to zrzuty przesyłam w załączeniu.
      </p>
      <p>
        Nie widzę zatem przesłanki legalizującej takie przetwarzanie moich
        danych osobowych (na pewno nie jest to przetwarzanie konieczne do
        wyświetlenia strony z technicznego punktu widzenia). Jeżeli takie
        przesłanki legalizujące jednak występują, proszę o ich wskazanie,
        <strong>
          {" "}
          dla każdego z celów i podmiotów z <em>osobna</em>
        </strong>
        .
      </p>
      <p>
        Jeżeli wskazaną przez Państwa przesłanką legalizującą dany element
        procesu przetwarzania danych osobowych przez Państwa stronę jest Art 6.
        pkt 1 lit. a) RODO (zgoda), na mocy Art. 7 pkt 1 RODO proszę o
        wykazanie, że udzieliłem Państwu zgodę na takie przetwarzanie moich
        danych osobowych zanim to przetwarzanie nastąpiło, oraz że ta zgoda jest
        ważna w świetle RODO (odnosząc się w szczególności do art. 7 ust. 3
        RODO). Z góry zaznaczam, że „ustawienia przeglądarki” nie stanowią
        ważnej w świetle RODO zgody.
      </p>
      <p>
        Jeżeli wskazaną przez Państwa przesłanką legalizującą dany element
        procesu przetwarzania danych osobowych przez Państwa stronę jest Art 6.
        pkt 1 lit. b) RODO (niezbędność takiego przetwarzania do wykonania
        umowy), proszę o wskazanie, w jaki sposób ta konieczność zachodzi, oraz
        co sprawia, że Państwa zdaniem nie można wykonać umowy związanej z
        wyświetleniem Państwa strony bez przekazywania sztucznie nadanego ID w
        plikach Cookies lub historii przeglądania w nagłówku Referer do
        wskazanych podmiotów trzecich.
      </p>
      <p>
        Jeżeli wskazaną przez Państwa przesłanką legalizującą dany element
        procesu przetwarzania danych osobowych przez Państwa stronę jest Art 6.
        pkt 1 lit. f) RODO (uzasadniony interes), proszę o wskazanie, jaki to
        jest <strong>konkretny interes</strong> (prosze o bardziej dokładny opis
        niż np. tylko "marketing"), oraz o wynik testu równowagi pomiędzy
        Państwa interesem a moimi podstawowymi wolnościami i prawami - ze
        wskazaniem tego, co sprawia, że w Państwa ocenie Państwa uzasadniony
        interes przeważa moje prawa i interesy w kontekście wspomnianych powyżej
        procesów przetwarzania danych.
      </p>
      <p>
        Niniejszym zwracam się także z żądaniem ujawnienia tożsamości podmiotów,
        które są właścicielami wyżej wymienionych domen, abym mógł zapoznać się
        z ich politykami prywatności i zwrócić się do tych podmiotów o usunięcie
        z ich baz wysłanych przez Państwa stronę moich danych.
      </p>
      <p>
        Proszę też o wysłanie kopii danych zebranych na mój temat i wysłanych do
        wyżej wymienionych podmiotów.
      </p>
      <p>
        W odpowiedzi proszę się nie powoływać na IAB Europe i ich rzekomą renomę
        w tworzeniu rozwiązań zgodnych z RODO. IAB chroni interes reklamodawców,
        a nie Użytkowników i ich rozwiązania (np. TCF) są notorycznie niezgodne
        z RODO i pozbawione szacunku dla Użytkowników.
      </p>
      <p>
        Apeluję także o wprowadzenie stosownych zmian na stronie tak, aby nie
        pozostawiać cienia wątpliwości odnośnie tego, na mocy jakiej przesłanki
        legalizującej dane są przetwarzane przez wspomniane podmioty trzecie,
        lub tak, aby te dane po prostu nie były wysyłane. Pomoże to zachować
        prywatność innym użytkownikom Państwa strony. Polecam Państwa uwadze
        oficjalne wytyczne EROD dotyczące zgody w kontekście RODO:
        https://edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_202005_consent_pl.pdf
        ). Aby na przykład zapobiec automatycznemu wysyłaniu historii
        przeglądania do podmiotów trzecich przez Państwa stronę, można po prostu
        ustawić odpowiednio treść nagłówka{" "}
        <a href="https://developer.mozilla.org/pl/docs/Web/HTTP/Headers/Referrer-Policy">
          Referrer-Policy{" "}
        </a>
        .
      </p>
    </div>
  );
}
