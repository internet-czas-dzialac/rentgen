console.log("PROBLEMATIC REQUESTS");

let memory = {};

function gethost(url) {
  return new URL(request.url).host;
}

function getshorthost(host) {
  return host.split(".").slice(-2).join(".");
}

// const isThirdParty = (arg) => arg.urlClassification.thirdParty.length > 0;
async function isThirdParty(request) {
  const request_url = new URL(request.url);
  const origin_url = new URL(await getOrigin(request));
  /* console.log(request_url.ho, origin_url, request_url.includes(origin_url)); */
  if (request_url.host.includes(origin_url.host)) {
    return false;
  }
  if (getshorthost(request_url.host) == getshorthost(origin_url.host)) {
    return false;
  }
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
      const shorthost = getshorthost(new URL(request.url).host);
      if (!memory[request.tabId][shorthost]) {
        memory[request.tabId][shorthost] = [];
      }
      memory[request.tabId][shorthost].push({
        url: request.url,
        has_cookie,
        cookie: request.requestHeaders.find((h) => h.name == "Cookie")?.value,
      });
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (sender.tab) {
    return;
  }
  if (request?.msg === "get_memory") {
    sendResponse(memory);
  } else if (request?.msg === "clear_memory") {
    memory = {};
  }
});
