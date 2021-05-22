output.innerHTML = "loading...";
let tabid = null;
let tab = null;
let memory = null;

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var currTab = tabs[0];
  if (currTab) {
    // Sanity check
    /* document.write(JSON.stringify(currTab)); */
    tabid = currTab.id;
    tab = currTab;
  }
});

function atLeastOneCookiedRequest(requests) {
  return requests.some((request) => request.has_cookie);
}

function sortByShorthost(tabdata) {
  return Object.entries(tabdata).sort(([shorthost1], [shorthost2]) => {
    return shorthost1 > shorthost2;
  });
}

function render(memory = {}) {
  let output_txt = "";
  if (!memory?.[tabid]) {
    output_txt = "No data for this tab";
    output.innerHTML = output_txt;
    return;
  }
  sortByShorthost(memory[tabid]).forEach(([shorthost, requests]) => {
    output_txt += /* HTML */ `${shorthost} ${
      atLeastOneCookiedRequest(requests) ? "🍪" : ""
    }</br>`;
  });
  output.innerHTML = output_txt;
}

chrome.runtime.sendMessage({ msg: "get_memory" }, (_memory) => {
  memory = _memory;
  render(memory);
});

clean.onclick = () => {
  chrome.runtime.sendMessage({ msg: "clear_memory" }, (memory_) => {
    memory = memory_;
    render(memory);
  });
};

function getDate() {
  return new Date().toISOString().split("T")[0];
}

copy.onclick = () => {
  const text_html = /* HTML */ `<p>
      Dzień dobry, w dniu ${getDate()} odwiedziłem stronę ${tab.url}. Strona ta
      bez mojej zgody wysłała moje dane osobowe do następujących podmiotów:
    </p>
    <ul>
      ${sortByShorthost(memory[tabid])
        .map(
          ([shorthost, requests]) => /* HTML */ `<li>
            Właściciel domeny <i>${shorthost}</i> otrzymał mój adres IP i część
            mojej historii
            przeglądania${atLeastOneCookiedRequest(requests)
              ? " <strong>opatrzoną sztucznie nadanym mi ID z Cookies</strong>"
              : ""};
          </li>`
        )
        .join("\n")}
    </ul>

    <p>
      Informacje te są automatycznie wysyłane przez Państwa stronę przez
      skrypty, które są na niej umieszczone. Pomimo faktu, że nie otrzymują
      Państwo bezpośrednio i nie przechowują tych danych, w świetle RODO są
      Państwo administratorem moich danych osobowych (utwierdza taki stan rzeczy
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
      pewno nie jest to przetwarzanie konieczne do wyświetlenia strony z punktu
      widzenia technicznego). Jeżeli takie przesłanki legalizujące jednak
      występują, proszę o ich wskazanie, dla każdego z celów i podmiotów z
      osobna.
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
      prywatność innym użytkownikom Państwa strony.
    </p> `;
  navigator.clipboard.write([
    new ClipboardItem({ "text/plain": text_html, "text/html": text_html }),
  ]);
};
