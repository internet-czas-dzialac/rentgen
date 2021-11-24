import { StolenDataEntry } from "./stolen-data-entry";
import {
  flattenObjectEntries,
  getshorthost,
  parseCookie,
  Request,
} from "./util";

type NameValue = { name: string; value: string };

export type HAREntry = {
  pageref: string;
  startedDateTime: string;
  request: {
    bodySize: number;
    cookies: NameValue[];
    headers: NameValue[];
    headersSize: number;
    httpVersion: string;
    method: string;
    postData?: {
      mimeType: string;
      params: NameValue[];
      text: string;
    };
    queryString: NameValue[];
    url: string;
  };
  response: {
    status: number;
    statusText: string;
    httpVersion: string;
    headers: NameValue[];
    cookies: NameValue[];
    content: {
      mimeType: string;
      size: number;
      encoding: "base64";
      text: string;
    };
    redirectURL: "";
    headersSize: number;
    bodySize: number;
  }; // not relevant
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
  public originalPathname: string;

  constructor(public data: Request) {
    this.tabId = data.tabId;
    this.url = data.url;
    this.requestHeaders = data.requestHeaders;
    this.shorthost = getshorthost(data.url);
  }

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
      } else {
        url = this.data.url;
      }
    }

    this.originalURL = url;
    this.origin = new URL(url).origin;
    this.originalPathname = new URL(url).pathname;
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
    return (
      this.data.requestHeaders.filter((h) => h.name === "Referer")[0]?.value ||
      "missing-referrer"
    );
  }

  exposesOrigin() {
    const url = new URL(this.originalURL);
    const host = url.host;
    const path = url.pathname;
    const shorthost = getshorthost(host);
    if (this.getReferer().includes(shorthost)) {
      return true;
    }
    for (const entry of this.stolenData) {
      if (
        entry.value.includes(host) ||
        entry.value.includes(path) ||
        entry.value.includes(shorthost)
      ) {
        return true;
      }
    }
    return false;
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
    return flattenObjectEntries(
      Object.entries(parseCookie(this.getCookie()))
        .map(([key, value]) => [key, value || ""])
        .map(([key, value]) => {
          return [key, StolenDataEntry.parseValue(value)];
        })
    ).map(([key, value]) => new StolenDataEntry(this, "cookie", key, value));
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
    return flattenObjectEntries(
      path
        .split(";")
        .map((e) => e.split("="))
        .map(([key, value]) => [key, value || ""])
        .map(([key, value]) => {
          return [key, StolenDataEntry.parseValue(decodeURIComponent(value))];
        })
    ).map(([key, value]) => new StolenDataEntry(this, "pathname", key, value));
  }

  getQueryParams(): StolenDataEntry[] {
    const url = new URL(this.data.url);
    return flattenObjectEntries(
      Array.from((url.searchParams as any).entries())
        .map(([key, value]) => [key, value || ""])
        .map(([key, value]) => {
          return [key, StolenDataEntry.parseValue(decodeURIComponent(value))];
        })
    ).map(([key, value]) => {
      return new StolenDataEntry(this, "queryparams", key, value);
    });
  }

  getHeadersData(): StolenDataEntry[] {
    return flattenObjectEntries(
      this.data.requestHeaders
        .filter((header) => {
          for (const regex of whitelisted_cookies) {
            if (regex.test(header.name)) {
              return false;
            }
          }
          return true;
        })
        .map((header) => {
          return [
            header.name,
            StolenDataEntry.parseValue(decodeURIComponent(header.value)),
          ];
        })
    ).map(([key, value]) => new StolenDataEntry(this, "header", key, value));
  }

  hasMark() {
    return this.stolenData.some((data) => data.isMarked);
  }

  getMarkedEntries() {
    return this.stolenData.filter((data) => data.isMarked);
  }

  getHost() {
    return new URL(this.url).host;
  }

  matchesHAREntry(har: HAREntry): boolean {
    const rq = this.data;
    const hrq = har.request;
    return rq.url == hrq.url;
  }

  toHAR(): HAREntry {
    return {
      pageref: "page_1",
      startedDateTime: `${new Date().toJSON().replace("Z", "+01:00")}`,
      request: {
        bodySize: 0,
        method: this.data.method,
        url: this.data.url,
        headersSize: 100,
        httpVersion: "HTTP/2",
        headers: this.data.requestHeaders as NameValue[],
        cookies: this.getCookieData().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        })),
        queryString: this.getQueryParams().map((param) => ({
          name: param.name,
          value: param.value,
        })),
      },
      response: {
        status: 200,
        statusText: "OK",
        httpVersion: "HTTP/2",
        headers: [],
        cookies: [],
        content: {
          mimeType: "text/plain",
          size: 15,
          encoding: "base64",
          text: "ZG9lc24ndCBtYXR0ZXIK",
        },
        redirectURL: "",
        headersSize: 15,
        bodySize: 15,
      },
      cache: {},
      timings: {
        blocked: -1,
        dns: 0,
        connect: 0,
        ssl: 0,
        send: 0,
        wait: 79,
        receive: 0,
      },
      time: 79,
      _securityState: "secure",
      serverIPAddress: "31.13.92.36",
      connection: "443",
    };
  }
}
