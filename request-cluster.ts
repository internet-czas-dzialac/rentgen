import { EventEmitter } from "events";
import ExtendedRequest from "./extended-request";
import { parseCookie } from "./util";

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

  getCookiesContent({
    minValueLength,
  }: {
    minValueLength: number;
  }): [string, string][] {
    const cookieValues = new Set<string>();
    for (const request of this.requests) {
      if (request.hasCookie()) {
        cookieValues.add(request.getCookie());
      }
    }
    return Array.from(cookieValues.values())
      .map(parseCookie)
      .map((o) => Object.entries(o))
      .reduce((a, b) => a.concat(b), [])
      .filter(([_, value]) => value.length >= minValueLength);
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
