import { StolenDataEntry } from "./stolen-data-entry";
import {
  flattenObjectEntries,
  getshorthost,
  parseCookie,
  Request,
  safeDecodeURIComponent,
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
      params: (NameValue & {
        fileName: string;
        contentType: string;
        comment: "";
      })[];
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

type RequestBody = {
  error?: string;
  formData?: Record<string, string[]>;
  raw?: { bytes: ArrayBuffer; file?: string }[];
};

export default class ExtendedRequest {
  public tabId: number;
  public url: string;
  public shorthost: string;
  public requestHeaders: Request["requestHeaders"] = [];
  public originalURL: string;
  public origin: string;
  public initialized = false;
  public stolenData: StolenDataEntry[];
  public originalPathname: string;
  public requestBody: RequestBody;

  static by_id = {} as Record<string, ExtendedRequest>;

  constructor(public data: Request) {
    this.tabId = data.tabId;
    this.url = data.url;
    this.shorthost = getshorthost(data.url);
    this.requestBody =
      ((data as any).requestBody as undefined | RequestBody) || {};
    if (this.url.includes("criteo")) {
      console.log(this);
    }
    ExtendedRequest.by_id[data.requestId] = this;
  }

  addHeaders(headers: Request["requestHeaders"]) {
    this.requestHeaders = headers;
    return this;
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
        this.requestHeaders.map(({ name, value }) => [name, value])
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
      this.requestHeaders.filter((h) => h.name === "Referer")[0]?.value ||
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
      ...this.getRequestBodyData(),
    ];
  }

  getCookieData(): StolenDataEntry[] {
    if (!this.hasCookie() || this.getCookie() === undefined) {
      return [];
    }
    return flattenObjectEntries(
      Object.entries(parseCookie(this.getCookie())).map(([key, value]) => [
        key,
        value || "",
      ]),
      StolenDataEntry.parseValue
    ).map(([key, value]) => new StolenDataEntry(this, "cookie", key, value));
  }

  getRequestBodyData(): StolenDataEntry[] {
    const ret = flattenObjectEntries(
      Object.entries({
        ...this.requestBody.formData,
        ...Object.fromEntries(
          Object.entries(
            this.requestBody.raw || {}
          ).map(([key, value], index) => [`${key}.${index}`, value])
        ),
      }).map(([key, value]) => {
        // to handle how ocdn.eu encrypts POST body on https://businessinsider.com.pl/
        if (
          (Array.isArray(value) && value.length === 1 && !value[0]) ||
          !value
        ) {
          return ["requestBody", key];
        } else if (!Array.isArray(value)) {
          return [
            "raw",
            String.fromCharCode.apply(null, new Uint8Array(value.bytes)),
          ];
        } else {
          return [key, value || ""];
        }
      }),
      StolenDataEntry.parseValue
    ).map(
      ([key, value]) => new StolenDataEntry(this, "request_body", key, value)
    );
    return ret;
  }

  hasReferer() {
    return this.requestHeaders.some((h) => h.name === "Referer");
  }

  hasCookie() {
    return this.requestHeaders.some((h) => h.name === "Cookie");
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
          return [
            key,
            StolenDataEntry.parseValue(safeDecodeURIComponent(value)),
          ];
        })
    ).map(([key, value]) => new StolenDataEntry(this, "pathname", key, value));
  }

  getQueryParams(): StolenDataEntry[] {
    const url = new URL(this.data.url);
    return flattenObjectEntries(
      Array.from((url.searchParams as any).entries())
        .map(([key, value]) => [key, value || ""])
        .map(([key, value]) => {
          return [
            key,
            StolenDataEntry.parseValue(safeDecodeURIComponent(value)),
          ];
        })
    ).map(([key, value]) => {
      return new StolenDataEntry(this, "queryparams", key, value);
    });
  }

  getHeadersData(): StolenDataEntry[] {
    return flattenObjectEntries(
      this.requestHeaders
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
            StolenDataEntry.parseValue(safeDecodeURIComponent(header.value)),
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
        bodySize:
          JSON.stringify(this.requestBody.formData || {}).length +
          (this.requestBody.raw || [])
            .map((e) => e.bytes.byteLength)
            .reduce((a, b) => a + b, 0),
        method: this.data.method,
        url: this.data.url,
        headersSize: JSON.stringify(this.requestHeaders).length,
        httpVersion: "HTTP/2",
        headers: this.requestHeaders as NameValue[],
        cookies: this.getCookieData().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        })),
        queryString: this.getQueryParams().map((param) => ({
          name: param.name,
          value: param.value,
        })),
        postData: {
          mimeType: "application/x-www-form-urlencoded",
          params: this.stolenData
            .filter((e) => e.source == "request_body")
            .map((e) => ({
              name: e.name,
              value: e.value,
              fileName: "--" + Math.ceil(Math.random() * 1000000000),
              contentType: "text/plain",
              comment: "",
            })),
          text: this.stolenData
            .filter((e) => e.source == "request_body")
            .map((e) => `${e.name}:\t${StolenDataEntry.parseValue(e.value)}`)
            .join("\n\n"),
        },
      },
      response: {
        status: 200,
        statusText: "OK",
        httpVersion: "HTTP/2",
        headers: [],
        cookies: [],
        content: {
          mimeType: "text/plain",
          size: this.getBalancedPriority(),
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

  getMaxPriority(): number {
    return Math.max(...this.stolenData.map((entry) => entry.getPriority()));
  }

  getBalancedPriority(): number {
    let result = 0;
    if (this.stolenData.some((e) => e.exposesPath())) {
      result += 50;
    }
    if (this.stolenData.some((e) => e.exposesHost())) {
      result += 50;
    }
    if (this.hasCookie()) {
      result += 50;
    }
    if (this.stolenData.some((e) => e.classification === "location")) {
      result += 300;
    }
    if (this.url.includes("facebook")) {
      result += 50;
    }
    return result;
  }
}
