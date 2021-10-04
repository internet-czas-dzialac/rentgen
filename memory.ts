import ExtendedRequest from "./extended-request";
import { getshorthost } from "./util";
import { EventEmitter } from "events";
import { RequestCluster } from "./request-cluster";

class Memory extends EventEmitter {
  tab_to_history = {} as Record<string, Record<string, RequestCluster>>;
  async register(request: ExtendedRequest) {
    await request.init();
    if (request.isThirdParty() && request.exposesOrigin()) {
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
