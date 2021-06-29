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

function extractAllCookies(requests) {
  return Array.from(new Set(requests.map((request) => request.cookie))).filter(
    (cookie) => cookie !== undefined
  );
}

function render(memory = {}) {
  let output_txt = "";
  if (!memory?.[tabid]) {
    output_txt = "No data for this tab";
    output.innerHTML = output_txt;
    return;
  }
  output_txt = /* HTML */ `<h2>
      Część Twojej historii przeglądania została wysłana przez stronę ${tab.url}
      do:
    </h2>
    <ul></ul>`;
  sortByShorthost(memory[tabid]).forEach(([shorthost, requests]) => {
    output_txt += /* HTML */ `
      <li>
        ${shorthost}
        ${atLeastOneCookiedRequest(requests)
          ? /*  HTML */ `🍪 <ul>
            ${extractAllCookies(requests)
              .map((cookie) => `<li><code>${cookie}</code></li>`)
              .join("\n")}
          </ul>`
          : ""}
      </li>
    `;
  });
  output_txt += "</ul>";
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

copy_harsh.onclick = () => {
  const text_html = harsh_email_template();
  navigator.clipboard.write([
    new ClipboardItem({ "text/plain": text_html, "text/html": text_html }),
  ]);
};

copy_polite.onclick = () => {
  const text_html = polite_email_template();
  navigator.clipboard.write([
    new ClipboardItem({ "text/plain": text_html, "text/html": text_html }),
  ]);
};
