import { getshorthost, Request } from "./util";

export default class ExtendedRequest {
  public tabId: number;
  public url: string;
  public requestHeaders: Request["requestHeaders"];

  async getOrigin() {
    let url: string;
    if (this.data.tabId && this.data.tabId >= 0) {
      const tab = await browser.tabs.get(this.data.tabId);
      url = tab.url;
    } else {
      url = (this.data as any).frameAncestors[0].url;
    }
    return url;
  }

  async isThirdParty() {
    const request_url = new URL(this.data.url);
    const origin_url = new URL(await this.getOrigin());
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

  async exposesOrigin() {
    return this.getReferer().includes(new URL(await this.getOrigin()).host);
  }

  hasReferer() {
    return this.data.requestHeaders.some((h) => h.name === "Referer");
  }

  hasCookie() {
    return this.data.requestHeaders.some((h) => h.name === "Cookie");
  }

  getCookie() {
    return this.requestHeaders.find((h) => h.name == "Cookie")?.value;
  }

  constructor(public data: Request) {
    this.tabId = data.tabId;
    this.url = data.url;
    this.requestHeaders = data.requestHeaders;
  }
}
