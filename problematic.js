console.log("PROBLEMATIC REQUESTS");

const isThirdParty = (arg) => arg.urlClassification.thirdParty.length > 0;
const hasCookie = (arg) => arg.requestHeaders.some((h) => h.name === "Cookie");
const hasReferer = (arg) =>
  arg.requestHeaders.some((h) => h.name === "Referer");

const getReferer = (arg) =>
  arg.requestHeaders.filter((h) => h.name === "Referer")[0].value;
const getOrigin = async (arg) => {
  let url;
  if (arg.tabId) {
    const tab = await browser.tabs.get(arg.tabId);
    url = tab.url;
  } else {
    url = arg.frameAncestors[0].url;
  }

  return new URL(url).host;
};

const exposesOrigin = async (arg) => {
  return getReferer(arg).includes(await getOrigin(arg));
};

browser.webRequest.onBeforeSendHeaders.addListener(
  async (request) => {
    // console.log(request.url, request.tabId);
    if (
      isThirdParty(request) &&
      hasReferer(request) &&
      (await exposesOrigin(request))
    ) {
      const has_cookie = hasCookie(request);
      fn = has_cookie ? console.warn : console.log;
      fn("Leaked referrer! Has cookie:", hasCookie(request), request.url);
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
);
