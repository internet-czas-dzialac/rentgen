import { EventEmitter } from "events";
import ExtendedRequest from "./extended-request";

export type Sources = "cookie" | "pathname" | "queryparams";

export class StolenDataEntry {
  constructor(
    public request: ExtendedRequest,
    public source: Sources,
    public name: string,
    public value: string
  ) {}

  getPriority() {
    let priority = 0;
    priority += this.value.length;
    const url = new URL(this.request.getOrigin());
    if (this.value.includes(url.host) || this.value.includes(url.pathname)) {
      priority += 100;
    }
    return priority;
  }
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

  getStolenData(filter: { minValueLength: number }): StolenDataEntry[] {
    return this.requests
      .map((request) => request.getAllStolenData())
      .reduce((a, b) => a.concat(b), [])
      .filter((entry) => {
        return entry.value.length >= filter.minValueLength;
      })
      .sort((entry1, entry2) =>
        entry1.getPriority() > entry2.getPriority() ? -1 : 1
      )
      .filter((element, index, array) => {
        // remove duplicate neighbours
        if (index == 0) {
          return true;
        }
        if (
          element.name != array[index - 1].name ||
          element.value != array[index - 1].value
        ) {
          return true;
        }
      });
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
