import { TCModel } from "@iabtcf/core";
import ExtendedRequest, { HAREntry } from "./extended-request";
import { getMemory } from "./memory";
import {
  getshorthost,
  isJSONObject,
  isURL,
  parseToObject,
  reduceConcat,
  unique,
} from "./util";

export type Sources = "cookie" | "pathname" | "queryparams" | "header";

export const Classifications = <const>{
  id: "Sztucznie nadane ID",
  history: "Część historii przeglądania",
};

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
  public classification: keyof typeof Classifications;

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
    this.classification = this.classify();
  }

  getPriority() {
    let priority = 0;
    priority += Math.min(this.value.length, 50);
    const url = new URL(this.request.originalURL);
    if (this.value.includes(url.host)) {
      priority += 100;
    }
    if (this.value.includes(url.pathname)) {
      priority += 100;
    }
    if (this.source === "cookie") {
      priority += 200;
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
          ((url.searchParams as unknown) as {
            entries: () => Iterable<[string, string]>;
          }).entries()
        ),
      };
      return object;
    } else {
      return value.toString();
    }
  }

  getParsedValue(key_path: string): string | Record<string, unknown> {
    let object = StolenDataEntry.parseValue(this.value);
    for (const key of key_path.split(".")) {
      if (key === "") continue;
      object = StolenDataEntry.parseValue(object[key]);
    }
    return object;
  }

  addMark(key: string) {
    this.markedKeys.push(key);
    getMemory().emit("change"); // to trigger rerender
  }

  hasMark(key?: string) {
    if (key) {
      return this.markedKeys.some((k) => k == key);
    } else {
      return this.markedKeys.length > 0;
    }
  }

  removeMark(key: string) {
    this.markedKeys = this.markedKeys.filter((e) => e != key);
    getMemory().emit("change"); // to trigger rerender
  }

  toggleMark(key: string) {
    if (this.hasMark(key)) {
      this.removeMark(key);
    } else {
      this.addMark(key);
    }
  }

  private classify(): keyof typeof Classifications {
    let result: keyof typeof Classifications;
    if (
      [this.value, decodeURIComponent(this.value)].some((haystack) =>
        [
          this.request.origin,
          this.request.originalURL,
          getshorthost(this.request.origin),
        ].some((needle) => haystack.includes(needle))
      )
    ) {
      result = "history";
    } else {
      result = "id";
    }
    return result;
  }

  isRelatedToID() {
    return this.request.stolenData.some(
      (entry) => (entry.classification = "id")
    );
  }

  matchesHAREntry(har: HAREntry): boolean {
    return this.request.matchesHAREntry(har);
  }
}

export class MergedStolenDataEntry {
  constructor(public entries: StolenDataEntry[]) {
    const all_marks = unique(
      entries.map((entry) => entry.markedKeys).reduce(reduceConcat, [])
    );
    for (const entry of entries) {
      entry.markedKeys = all_marks;
    }
    // getMemory().emit("change"); // to trigger render
  }

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
    return unique(this.entries.map((e) => e.name));
  }

  getSources(): string[] {
    return unique(this.entries.map((e) => e.source));
  }

  getValues() {
    return unique(this.entries.map((e) => e.value));
  }

  getParsedValues(key_path: string) {
    return Array.from(
      new Set(this.entries.map((e) => e.getParsedValue(key_path)))
    );
  }

  addMark(key: string) {
    this.entries.forEach((entry) => entry.addMark(key));
  }

  getMarkedValues() {
    return this.entries
      .map((entry) => entry.markedKeys)
      .reduce((a, b) => a.concat(b), []);
  }

  hasMark(key: string): boolean {
    return this.entries.some((entry) => entry.hasMark(key));
  }

  toggleMark(key: string): void {
    this.entries.forEach((entry) => entry.toggleMark(key));
  }
}
