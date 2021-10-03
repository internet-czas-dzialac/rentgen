function harsh_email_template() {
  const text_html = /* HTML */ `<p>
      Dzień dobry, w dniu ${getDate()} odwiedziłem stronę ${tab.url}. Strona ta
      bez mojej zgody wysłała moje dane osobowe do następujących podmiotów:
    </p>
    ${renderDataList()}
    <p>
      Informacje te są automatycznie wysyłane przez Państwa stronę przez
      skrypty, które są na niej umieszczone. Pomimo faktu, że nie otrzymują
      Państwo bezpośrednio i nie przechowują tych danych, w świetle RODO są
      Państwo współadministratorem moich danych osobowych (utwierdza taki stan
      rzeczy
      <a
        href="https://curia.europa.eu/juris/document/document.jsf?text=&docid=216555&pageIndex=0&doclang=PL&mode=lst&dir=&occ=first&part=1&cid=3313819"
      >
        wyrok TSUE w sprawie C‑40/17 </a
      >). W załączeniu przesyłam zrzuty ekranów prezentujące wysłane przez
      Państwa stronę dane osobowe, wraz z ich adresatami.
    </p>
    <p>
      Dane te zostały przesłane bez mojej zgody i nastąpiło to zanim miałem w
      ogóle szansę przeczytać Państwa politykę prywatności. Nie widzę zatem
      przesłanki legalizującej takie przetwarzanie moich danych osobowych (na
      pewno nie jest to przetwarzanie konieczne do wyświetlenia strony z
      technicznego punktu widzenia). Jeżeli takie przesłanki legalizujące jednak
      występują, proszę o ich wskazanie,
      <strong> dla każdego z celów i podmiotów z osobna</strong>.
    </p>
    <p>
      Jeżeli wskazaną przez Państwa przesłanką legalizującą dany element procesu
      przetwarzania danych osobowych przez Państwa stronę jest Art 6. pkt 1 lit.
      a) RODO (zgoda), na mocy Art. 7 pkt 1 RODO proszę o wykazanie, że
      udzieliłem Państwu zgodę na takie przetwarzanie moich danych osobowych
      zanim to przetwarzanie nastąpiło, oraz że ta zgoda jest ważna w świetle
      RODO (odnosząc się w szczególności do art. 7 ust. 3 RODO). Z góry
      zaznaczam, że „ustawienia przeglądarki” nie stanowią ważnej w świetle RODO
      zgody.
    </p>
    <p>
      Jeżeli wskazaną przez Państwa przesłanką legalizującą dany element procesu
      przetwarzania danych osobowych przez Państwa stronę jest Art 6. pkt 1 lit.
      b) RODO (niezbędność takiego przetwarzania do wykonania umowy), proszę o
      wskazanie, w jaki sposób ta konieczność zachodzi, oraz co sprawia, że
      Państwa zdaniem nie można wykonać umowy związanej z wyświetleniem Państwa
      strony bez przekazywania sztucznie nadanego ID w plikach Cookies lub
      historii przeglądania w nagłówku Referer do wskazanych podmiotów trzecich.
    </p>
    <p>
      Jeżeli wskazaną przez Państwa przesłanką legalizującą dany element procesu
      przetwarzania danych osobowych przez Państwa stronę jest Art 6. pkt 1 lit.
      f) RODO (uzasadniony interes), proszę o wskazanie, jaki to jest konkretny
      interes, oraz o wynik testu równowagi pomiędzy Państwa interesem a moimi
      podstawowymi wolnościami i prawami - ze wskazaniem tego, co sprawia, że w
      Państwa ocenie Państwa uzasadniony interes przeważa moje prawa i interesy
      w kontekście wspomnianych powyżej procesów przetwarzania danych.
    </p>
    <p>
      Niniejszym zwracam się także z żądaniem wycofania przesłanych przez
      Państwa stronę moich danych osobowych z baz wyżej wymienionych podmiotów
      oraz przesłania potwierdzenia uwiarygadniającego pomyślne wycofanie tych
      danych. Proszę też o przesłanie tożsamości podmiotów, które są
      właścicielami wyżej wymienionych domen, abym mógł zapoznać się z ich
      politykami prywatności.
    </p>
    <p>
      Proszę też o wysłanie kopii danych zebranych na mój temat i wysłanych do
      wyżej wymienionych podmiotów.
    </p>
    <p>
      Apeluję także o wprowadzenie stosownych zmian na stronie tak, aby nie
      pozostawiać cienia wątpliwości odnośnie tego, na mocy jakiej przesłanki
      legalizującej dane są przetwarzane przez wspomniane podmioty trzecie, lub
      tak, aby te dane po prostu nie były wysyłane. Pomoże to zachować
      prywatność innym użytkownikom Państwa strony. Polecam Państwa uwadze
      oficjalne wytyczne EROD dotyczące zgody w kontekście RODO:
      https://edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_202005_consent_pl.pdf
      ). Aby na przykład zapobiec automatycznemu wysyłaniu historii przeglądania
      do podmiotów trzecich przez Państwa stronę, można po prostu ustawić
      odpowiednio treść nagłówka
      <a
        href="https://developer.mozilla.org/pl/docs/Web/HTTP/Headers/Referrer-Policy"
      >
        Referrer-Policy </a
      >.
    </p> `;
  return text_html;
}
