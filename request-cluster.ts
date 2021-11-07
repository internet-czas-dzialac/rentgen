import { EventEmitter } from "events";
import ExtendedRequest from "./extended-request";

export type Sources = "cookie" | "pathname" | "queryparams" | "header";

import { TCString, TCModel } from "@iabtcf/core";
import { isJSONObject, isURL, parseToObject } from "./util";

const id = (function* id() {
  let i = 0;
  while (true) {
    i++;
    yield i;
  }
})();

export class StolenDataEntry {
  public isIAB = false;
  public iab: TCModel | null = null;
  public id: number;
  public markedKeys: string[] = [];

  constructor(
    public request: ExtendedRequest,
    public source: Sources,
    public name: string,
    public value: string
  ) {
    // try {
    //   this.iab = TCString.decode(value);
    //   // console.log(this.iab);
    //   this.isIAB = true;
    // } catch (e) {}
    this.id = id.next().value as number;
  }

  getPriority() {
    let priority = 0;
    priority += this.value.length;
    const url = new URL(this.request.getOrigin());
    if (this.value.includes(url.host) || this.value.includes(url.pathname)) {
      priority += 100;
    }
    return priority;
  }

  mergeWith(entry: StolenDataEntry): MergedStolenDataEntry {
    return new MergedStolenDataEntry([this, entry]);
  }

  hasValue(value: string) {
    return this.value === value;
  }

  static parseValue(value: unknown): string | Record<string, unknown> {
    if (isJSONObject(value)) {
      const object = parseToObject(value);
      return object;
    } else if (isURL(value)) {
      const url = new URL(value);
      const object = {
        host: url.host,
        path: url.pathname,
        ...Object.fromEntries(
          (
            url.searchParams as unknown as {
              entries: () => Iterable<[string, string]>;
            }
          ).entries()
        ),
      };
      return object;
    } else {
      return value.toString();
    }
  }

  getParsedValue(key_path: string): string | Record<string, unknown> {
    let object = StolenDataEntry.parseValue(this.value);
    console.log("key_path", key_path);
    for (const key of key_path.split(".")) {
      if (key === "") continue;
      console.log(key, object[key]);
      object = StolenDataEntry.parseValue(object[key]);
    }
    return object;
  }

  addMarkedValue(key: string) {
    this.markedKeys.push(key);
  }
}

export class MergedStolenDataEntry {
  constructor(public entries: StolenDataEntry[]) {}

  hasValue(value: string) {
    return this.entries.some((entry) => entry.value === value);
  }

  mergeWith(entry: StolenDataEntry) {
    this.entries.push(entry);
    return this;
  }

  getPriority() {
    return Math.max(...this.entries.map((entry) => entry.getPriority()));
  }

  getUniqueKey() {
    return `${this.getNames().join(":")};${this.entries
      .map((e) => e.id)
      .join(":")};`;
  }

  getNames(): string[] {
    return Array.from(new Set(this.entries.map((e) => e.name)));
  }

  getSources(): string[] {
    return Array.from(new Set(this.entries.map((e) => e.source)));
  }

  getValues() {
    return Array.from(new Set(this.entries.map((e) => e.value)));
  }

  getParsedValues(key_path: string) {
    return Array.from(
      new Set(this.entries.map((e) => e.getParsedValue(key_path)))
    );
  }

  addMarkedValue(key: string) {
    this.entries.forEach((entry) => entry.addMarkedValue(key));
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
}
