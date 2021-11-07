import { EventEmitter } from "events";
import ExtendedRequest from "./extended-request";
import { MergedStolenDataEntry, StolenDataEntry } from "./stolen-data-entry";

import { allSubhosts, unique } from "./util";

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

  getStolenData(filter: {
    minValueLength: number;
    cookiesOnly: boolean;
  }): MergedStolenDataEntry[] {
    return this.requests
      .map((request) => request.stolenData)
      .reduce((a, b) => a.concat(b), [])
      .filter((entry) => {
        return entry.value.length >= filter.minValueLength;
      })
      .filter((entry) => !filter.cookiesOnly || entry.source === "cookie")
      .sort((entryA, entryB) => (entryA.name > entryB.name ? -1 : 1))
      .filter((element, index, array) => {
        // remove duplicates by name/value
        if (index == 0) {
          return true;
        }
        if (
          element.name != array[index - 1].name ||
          element.value != array[index - 1].value
        ) {
          return true;
        }
      })
      .sort((entryA, entryB) => (entryA.value > entryB.value ? -1 : 1))
      .reduce(
        (acc: MergedStolenDataEntry[], entry: StolenDataEntry) => {
          // group by value
          const last_entry = acc.slice(-1)[0];
          if (last_entry.hasValue(entry.value)) {
            last_entry.mergeWith(entry);
          } else {
            acc.push(new MergedStolenDataEntry([entry]));
          }
          return acc;
        },
        [new MergedStolenDataEntry([])] as MergedStolenDataEntry[]
      )
      .sort((entry1, entry2) =>
        entry1.getPriority() > entry2.getPriority() ? -1 : 1
      );
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

  getMarkedRequests() {
    return this.requests.filter((request) => request.hasMark());
  }

  getFullHosts() {
    return unique(
      this.requests
        .map((request) => allSubhosts(request.getHost()))
        .reduce((a, b) => a.concat(b), [])
    );
  }
}
