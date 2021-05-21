output.innerHTML = "loading...";
let tabid = null;
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var currTab = tabs[0];
  if (currTab) {
    // Sanity check
    /* document.write(JSON.stringify(currTab)); */
    tabid = currTab.id;
  }
});

function render(memory = {}) {
  let output_txt = "";
  if (!memory?.[tabid]) {
    output_txt = "No data for this tab";
  }
  Object.keys(memory[tabid]).forEach(
    (host) => (output_txt += /* HTML */ `${host}</br>`)
  );
  output.innerHTML = output_txt;
}

chrome.runtime.sendMessage({ msg: "get_memory" }, (memory) => {
  render(memory);
});

clean.onclick = () => {
  chrome.runtime.sendMessage({ msg: "clear_memory" }, render);
};
