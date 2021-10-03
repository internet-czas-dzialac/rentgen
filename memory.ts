import ExtendedRequest from "./extended-request";
import { getshorthost } from "./util";
import { EventEmitter } from "events";

export class RequestCluster extends EventEmitter {
  public requests: ExtendedRequest[] = [];
  constructor(public id: string) {
    super();
  }
  add(request: ExtendedRequest) {
    this.requests.push(request);
    this.emit("change");
  }

  hasCookies() {
    for (const request of this.requests) {
      if (request.hasCookie()) {
        return true;
      }
    }
    return false;
  }

  getCookiesContent(): string[] {
    const cookieValues = new Set<string>();
    for (const request of this.requests) {
      if (request.hasCookie()) {
        cookieValues.add(request.getCookie());
      }
    }
    return Array.from(cookieValues.values());
  }

  static sortCompare(a: RequestCluster, b: RequestCluster) {
    if (a.hasCookies() == b.hasCookies()) {
      if (a.id < b.id) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (a.hasCookies()) {
        return -1;
      } else {
        return 1;
      }
    }
  }
}

class Memory extends EventEmitter {
  tab_to_history = {} as Record<string, Record<string, RequestCluster>>;
  async register(request: ExtendedRequest) {
    if (
      (await request.isThirdParty()) &&
      request.hasReferer() &&
      (await request.exposesOrigin())
    ) {
      if (!this.tab_to_history[request.tabId]) {
        this.tab_to_history[request.tabId] = {};
      }
      const shorthost = getshorthost(new URL(request.url).host);
      if (!this.tab_to_history[request.tabId][shorthost]) {
        const cluster = new RequestCluster(shorthost);
        this.tab_to_history[request.tabId][shorthost] = cluster;
      }
      this.tab_to_history[request.tabId][shorthost].add(request);
      this.emit("change");
    }
  }

  constructor() {
    super();
    browser.webRequest.onBeforeSendHeaders.addListener(
      async (request) => {
        this.register(new ExtendedRequest(request));
      },
      { urls: ["<all_urls>"] },
      ["requestHeaders"]
    );
  }

  getClustersForTab(tab_id: number): Record<string, RequestCluster> {
    return this.tab_to_history[tab_id] || {};
  }
}

const memory = new Memory();

export default memory;
