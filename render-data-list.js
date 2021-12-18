function renderDataList() {
  return /* HTML */ ` <ul>
    ${sortByShorthost(memory[tabid])
      .map(
        ([shorthost, requests]) => /* HTML */ `<li>
          właściciel domeny <i>${shorthost}</i> otrzymał mój adres IP i część
          mojej historii
          przeglądania${atLeastOneCookiedRequest(requests)
            ? " <strong>opatrzoną moim identyfikatorem internetowym z Cookies</strong>"
            : ""};
        </li>`
      )
      .join("\n")}
  </ul>`;
}
