console.log("PROBLEMATIC REQUESTS");

let memory = {};

// const isThirdParty = (arg) => arg.urlClassification.thirdParty.length > 0;
async function isThirdParty(request) {
  const request_url = new URL(request.url);
  const origin_url = new URL(await getOrigin(request));
  return (
    request_url.origin != origin_url.origin ||
    request.urlClassification.thirdParty.length > 0
  );
}
const hasCookie = (arg) => arg.requestHeaders.some((h) => h.name === "Cookie");
const hasReferer = (arg) =>
  arg.requestHeaders.some((h) => h.name === "Referer");

const getReferer = (arg) =>
  arg.requestHeaders.filter((h) => h.name === "Referer")[0].value;

const getOrigin = async (arg) => {
  let url;
  if (arg.tabId && arg.tabId >= 0) {
    const tab = await browser.tabs.get(arg.tabId);
    url = tab.url;
  } else {
    url = arg.frameAncestors[0].url;
  }

  return url;
};

const exposesOrigin = async (arg) => {
  return getReferer(arg).includes(new URL(await getOrigin(arg)).host);
};

browser.webRequest.onBeforeSendHeaders.addListener(
  async (request) => {
    if (
      (await isThirdParty(request)) &&
      hasReferer(request) &&
      (await exposesOrigin(request))
    ) {
      const has_cookie = hasCookie(request);
      if (!memory[request.tabId]) {
        memory[request.tabId] = {};
      }
      const shorthost = new URL(request.url).host
        .match(/((\.[^.]+){2}$)/)[0]
        .slice(1);
      if (!memory[request.tabId][shorthost]) {
        memory[request.tabId][shorthost] = [];
      }
      memory[request.tabId][shorthost].push({ url: request.url, has_cookie });
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (sender.tab) {
    return;
  }
  console.log("got message!", request);
  if (request?.msg === "get_memory") {
    sendResponse(memory);
  } else if (request?.msg === "clear_memory") {
    console.log("memory cleared");
    memory = {};
  }
});
