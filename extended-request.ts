import { StolenDataEntry } from "./stolen-data-entry";
import { getshorthost, parseCookie, Request } from "./util";

export type HAREntry = {
  pageref: string;
  startedDateTime: string;
  request: {
    bodySize: number;
    cookies: {}[];
    headers: {}[];
    headersSize: number;
    httpVersion: string;
    method: string;
    postData: {
      mimeType: string;
      params: { name: string; value: string }[];
      text: string;
    };
    queryString: { name: string; value: string }[];
    url: string;
  };
  response: {}; // not relevant
  cache: {};
  timings: {};
  time: number;
  _securityState: string;
  serverIPAddress: string;
  connection: string;
};

const whitelisted_cookies = [
  /^Accept.*$/,
  /^Host$/,
  /^Connection$/,
  /^Sec-Fetch-.*$/,
  /^Content-Type$/,
  /^Cookie$/, // we're extracting it in getCookie separately anyway
  /^User-Agent$/,
];

export default class ExtendedRequest {
  public tabId: number;
  public url: string;
  public shorthost: string;
  public requestHeaders: Request["requestHeaders"];
  public originalURL: string;
  public origin: string;
  public initialized = false;
  public stolenData: StolenDataEntry[];

  async init() {
    await this.cacheOrigin();
    this.initialized = true;
    this.stolenData = this.getAllStolenData();
  }

  async cacheOrigin(): Promise<void> {
    let url: string;
    if (this.data.tabId && this.data.tabId >= 0) {
      const tab = await browser.tabs.get(this.data.tabId);
      url = tab.url;
    } else if ((this.data as any)?.frameAncestors) {
      url = (this.data as any).frameAncestors[0].url || "";
    } else {
      const headers = Object.fromEntries(
        this.data.requestHeaders.map(({ name, value }) => [name, value])
      );
      if (headers.Referer) {
        url = headers.Referer;
      }
    }

    this.originalURL = url;
    this.origin = new URL(url).origin;
  }

  isThirdParty() {
    const request_url = new URL(this.data.url);
    const origin_url = new URL(this.originalURL);
    if (request_url.host.includes(origin_url.host)) {
      return false;
    }
    if (getshorthost(request_url.host) == getshorthost(origin_url.host)) {
      return false;
    }
    return (
      request_url.origin != origin_url.origin ||
      (this.data as any).urlClassification.thirdParty.length > 0
    );
  }

  getReferer() {
    return this.data.requestHeaders.filter((h) => h.name === "Referer")[0]
      .value;
  }

  exposesOrigin() {
    const url = new URL(this.origin);
    const host = url.host;
    const path = url.pathname;
    return (
      this.getReferer().includes(host) ||
      this.stolenData.filter(
        (entry) => entry.value.includes(host) || entry.value.includes(path)
      ).length > 0
    );
  }

  private getAllStolenData(): StolenDataEntry[] {
    return [
      ...this.getPathParams(),
      ...this.getCookieData(),
      ...this.getQueryParams(),
      ...this.getHeadersData(),
    ];
  }

  getCookieData(): StolenDataEntry[] {
    if (!this.hasCookie() || this.getCookie() === undefined) {
      return [];
    }
    return Object.entries(parseCookie(this.getCookie()))
      .map(([key, value]) => [key, value || ""])
      .map(([key, value]) => new StolenDataEntry(this, "cookie", key, value));
  }

  hasReferer() {
    return this.data.requestHeaders.some((h) => h.name === "Referer");
  }

  hasCookie() {
    return this.data.requestHeaders.some((h) => h.name === "Cookie");
  }

  getCookie(): string {
    return this.requestHeaders.find((h) => h.name == "Cookie")?.value;
  }

  getPathParams(): StolenDataEntry[] {
    const url = new URL(this.data.url);
    const path = url.pathname;
    if (!path.includes(";")) {
      return [];
    }
    return path
      .split(";")
      .map((e) => e.split("="))
      .map(([key, value]) => [key, value || ""])
      .map(
        ([key, value]) =>
          new StolenDataEntry(this, "pathname", key, decodeURIComponent(value))
      );
  }

  getQueryParams(): StolenDataEntry[] {
    const url = new URL(this.data.url);
    return Array.from((url.searchParams as any).entries())
      .map(([key, value]) => [key, value || ""])
      .map(([key, value]) => {
        try {
          value = decodeURIComponent(value);
        } catch (e) {}
        return new StolenDataEntry(this, "queryparams", key, value);
      });
  }

  getHeadersData(): StolenDataEntry[] {
    return this.data.requestHeaders
      .filter((header) => {
        for (const regex of whitelisted_cookies) {
          if (regex.test(header.name)) {
            return false;
          }
        }
        return true;
      })
      .map(
        (header) =>
          new StolenDataEntry(this, "header", header.name, header.value)
      );
  }

  constructor(public data: Request) {
    this.tabId = data.tabId;
    this.url = data.url;
    this.requestHeaders = data.requestHeaders;
    this.shorthost = getshorthost(data.url);
  }

  hasMark() {
    return this.stolenData.some((data) => data.hasMark());
  }

  getMarkedEntries() {
    return this.stolenData.filter((data) => data.hasMark());
  }

  getHost() {
    return new URL(this.url).host;
  }

  matchesHAREntry(har: HAREntry): boolean {
    const rq = this.data;
    const hrq = har.request;
    return rq.url == hrq.url;
  }
}
