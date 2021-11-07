import ExtendedRequest from "./extended-request";
import { getshorthost } from "./util";
import { EventEmitter } from "events";
import { RequestCluster } from "./request-cluster";

class Memory extends EventEmitter {
  origin_to_history = {} as Record<string, Record<string, RequestCluster>>;
  async register(request: ExtendedRequest) {
    await request.init();
    console.log("registering request for", request.origin);
    if (!request.isThirdParty()) {
      return;
    }
    if (!this.origin_to_history[request.origin]) {
      this.origin_to_history[request.origin] = {};
    }
    const shorthost = getshorthost(new URL(request.url).host);
    if (!this.origin_to_history[request.origin][shorthost]) {
      const cluster = new RequestCluster(shorthost);
      this.origin_to_history[request.origin][shorthost] = cluster;
    }
    this.origin_to_history[request.origin][shorthost].add(request);
    this.emit("change");
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

  getClustersForOrigin(origin: string): Record<string, RequestCluster> {
    return this.origin_to_history[origin] || {};
  }

  async removeCookiesFor(origin: string, shorthost?: string): Promise<void> {
    if (shorthost) {
      const cookies = await browser.cookies.getAll({ domain: shorthost });
      for (const cookie of cookies) {
        console.log("removing cookie", cookie.name, "from", cookie.domain);
        await browser.cookies.remove({
          name: cookie.name,
          url: `https://${cookie.domain}`,
        });
      }
    } else {
      const clusters = this.getClustersForOrigin(origin);

      await Promise.all(
        Object.values(clusters)
          .filter((cluster) => !shorthost || cluster.id === shorthost)
          .map((cluster) => this.removeCookiesFor(origin, cluster.id))
      );
    }
  }

  async removeRequestsFor(origin: string) {
    this.origin_to_history[origin] = {};
  }
}

const memory = new Memory();

export default memory;
