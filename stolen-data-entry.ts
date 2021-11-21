import { TCModel } from "@iabtcf/core";
import { EventEmitter } from "events";
import ExtendedRequest, { HAREntry } from "./extended-request";
import Mark from "./mark";
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
  location: "Informacje na temat mojego położenia",
};

const ID_PREVIEW_MAX_LENGTH = 20;

const id = (function* id() {
  let i = 0;
  while (true) {
    i++;
    yield i;
  }
})();

export class StolenDataEntry extends EventEmitter {
  public isIAB = false;
  public iab: TCModel | null = null;
  public id: number;
  public marks: Mark[] = [];
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
    super();
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
      let hash = url.hash;
      if (hash.includes("=")) {
        //facebook sometimes includes querystring-encoded data into the hash... attempt to parse it
        try {
          hash = Object.fromEntries(
            hash
              .slice(1)
              .split("&")
              .map((kv) => kv.split("="))
          );
        } catch (e) {
          // failed to parse as query string
          console.log(
            "Failed attempt to parse hash location as query string, probably safe to ignore:",
            e
          );
        }
      }
      const object = {
        [Symbol.for("originalURL")]: value, // so it doesn't appear raw in the table but can be easily retrieved later
        host: url.host,
        path: url.pathname,
        ...Object.fromEntries(
          ((url.searchParams as unknown) as {
            entries: () => Iterable<[string, string]>;
          }).entries()
        ),
        ...(hash === "" ? {} : typeof hash === "string" ? { hash } : hash),
      };
      return object;
    } else {
      return value.toString();
    }
  }

  getParsedValue(key_path: string): string | Record<string | symbol, unknown> {
    let object = StolenDataEntry.parseValue(this.value);
    for (const key of key_path.split(".")) {
      if (key === "") continue;
      object = StolenDataEntry.parseValue(object[key]);
    }
    return object;
  }

  addMark(key: string) {
    this.marks.push(new Mark(this, key));
    this.emit("change");
  }

  hasMark(key?: string) {
    if (key) {
      return this.marks.some((k) => k.key == key);
    } else {
      return this.marks.length > 0;
    }
  }

  removeMark(key: string) {
    this.marks = this.marks.filter((mark) => mark.key != key);
    this.emit("change");
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

  getValuePreview(key = ""): string {
    const value = this.getParsedValue(key);
    const str = value.toString();
    if (typeof value !== "object" && this.classification == "id") {
      return (
        str.slice(0, Math.min(str.length / 3, ID_PREVIEW_MAX_LENGTH)) + "(...)"
      );
    } else if (typeof value === "object" && value[Symbol.for("originalURL")]) {
      return value[Symbol.for("originalURL")] as string;
    } else {
      return str;
    }
  }
}

export class MergedStolenDataEntry extends EventEmitter {
  constructor(public entries: StolenDataEntry[]) {
    super();
    const all_marks = unique(
      entries.map((entry) => entry.marks).reduce(reduceConcat, [])
    );
    for (const entry of entries) {
      entry.marks = all_marks;
    }
    // getMemory().emit("change"); // to trigger render
  }

  on(event: string, listener: () => void) {
    for (const entry of this.entries) {
      entry.on(event, listener);
    }
    return this;
  }

  removeListener(event: string, listener: () => void) {
    for (const entry of this.entries) {
      entry.removeListener(event, listener);
    }
    return this;
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
      .map((entry) => entry.marks)
      .reduce((a, b) => a.concat(b), []);
  }

  hasMark(key: string): boolean {
    return this.entries.some((entry) => entry.hasMark(key));
  }

  toggleMark(key: string): void {
    this.entries.forEach((entry) => entry.toggleMark(key));
  }
}
