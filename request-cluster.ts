import { EventEmitter } from "events";
import ExtendedRequest from "./extended-request";
import { Sources, StolenDataEntry } from "./stolen-data-entry";

import { allSubhosts, isSameURL, reduceConcat, unique } from "./util";

const source_priority: Array<Sources> = [
  "cookie",
  "pathname",
  "queryparams",
  "header",
];

export class RequestCluster extends EventEmitter {
  public requests: ExtendedRequest[] = [];
  public representativeStolenData: StolenDataEntry[] = [];
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

  calculatetRepresentativeStolenData(
    filter: {
      minValueLength: number;
      cookiesOnly: boolean;
      cookiesOrOriginOnly: boolean;
    } = { minValueLength: 0, cookiesOnly: false, cookiesOrOriginOnly: false }
  ): StolenDataEntry[] {
    this.representativeStolenData = this.requests
      .map((request) => request.stolenData)

      .reduce((a, b) => a.concat(b), [])
      .filter((entry) => {
        return entry.value.length >= filter.minValueLength;
      })
      .filter((entry) => !filter.cookiesOnly || entry.source === "cookie")
      .filter(
        (entry) =>
          !filter.cookiesOrOriginOnly ||
          entry.source === "cookie" ||
          entry.classification === "history"
      )
      .sort((entry1, entry2) => {
        if (entry1.value > entry2.value) {
          return -1;
        } else if (entry1.value < entry2.value) {
          return 1;
        } else {
          const indexA = source_priority.indexOf(entry1.source);
          const indexB = source_priority.indexOf(entry2.source);
          if (indexA < indexB) {
            return -1;
          } else if (indexA > indexB) {
            return 1;
          } else if (entry1.value.length > entry2.value.length) {
            return -1;
          } else if (entry1.value.length < entry2.value.length) {
            return 1;
          } else if (entry1.isMarked && !entry2.isMarked) {
            return -1;
          } else if (!entry1.isMarked && entry2.isMarked) {
            return 1;
          } else {
            return 0;
          }
        }
      })
      .filter((_, index, array) => {
        // removing value duplicates
        if (index == 0) {
          return true;
        }
        if (
          array[index].getValuePreview() ===
            array[index - 1].getValuePreview() ||
          isSameURL(array[index].value, array[index - 1].value)
        ) {
          return false;
        } else {
          return true;
        }
      })
      .sort((entry1, entry2) => {
        if (entry1.name < entry2.name) {
          return -1;
        } else if (entry1.name > entry2.name) {
          return 1;
        } else {
          if (entry1.value.length > entry2.value.length) {
            return 1;
          } else {
            return -1;
          }
        }
      })
      .filter((_, index, array) => {
        // removing name duplicates, keeping only the first - which is the longest. Some data loss may occur.
        if (index == 0) {
          return true;
        }
        if (array[index].name === array[index - 1].name) {
          return false;
        } else {
          return true;
        }
      })
      .sort((entry1, entry2) =>
        entry1.getPriority() > entry2.getPriority() ? -1 : 1
      );
    return this.representativeStolenData;
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

  hasMarks() {
    return this.requests.some((request) => request.hasMark());
  }

  getMarkedEntries(): StolenDataEntry[] {
    return this.requests
      .map((request) => request.getMarkedEntries())
      .reduce(reduceConcat, []);
  }

  exposesOrigin() {
    return this.requests.some((request) => request.exposesOrigin());
  }

  autoMark() {
    this.calculatetRepresentativeStolenData();
    this.representativeStolenData.forEach((entry) => {
      entry.autoMark();
    });
  }
}
