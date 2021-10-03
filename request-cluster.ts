import { EventEmitter } from "events";
import ExtendedRequest from "./extended-request";
import { parseCookie } from "./util";

export class StolenDataEntry {
  constructor(public type: string, public name: string, public value: string) {}
}

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
  }): StolenDataEntry[] {
    this.getQueryParamsContent({ minValueLength });
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
      .map(([key, value]) => new StolenDataEntry("cookie", key, value))
      .filter((e) => e.value.length >= minValueLength);
  }

  getQueryParamsContent({
    minValueLength,
  }: {
    minValueLength: number;
  }): StolenDataEntry[] {
    const result = [];
    for (const request of this.requests) {
      console.log(request.data.url);
    }
    return result;
  }

  getPathnameParamsContent({
    minValueLength,
  }: {
    minValueLength: number;
  }): StolenDataEntry[] {
    let result = [];
    for (const request of this.requests) {
      result = [...result, ...request.getPathParams()];
    }
    console.log("PATHNAME PARAMS FOR", this.id, result);
    return result;
  }

  getStolenData(filter: { minValueLength: number }) {
    return [
      ...this.getCookiesContent(filter),
      ...this.getPathnameParamsContent(filter),
    ];
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
