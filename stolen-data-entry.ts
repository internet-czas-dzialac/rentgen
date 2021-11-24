// import { TCModel } from "@iabtcf/core";
import { EventEmitter } from "events";
import ExtendedRequest, { HAREntry } from "./extended-request";

import {
  getshorthost,
  isBase64,
  isBase64JSON,
  isJSONObject,
  isURL,
  maskString,
  parseToObject,
} from "./util";

export type Sources = "cookie" | "pathname" | "queryparams" | "header";

export const Classifications = <const>{
  id: "Sztucznie nadane ID",
  history: "Część historii przeglądania",
  location: "Informacje na temat mojego położenia",
};

const ID_PREVIEW_MAX_LENGTH = 20;
const MIN_COOKIE_LENGTH_FOR_AUTO_MARK = 15;

const id = (function* id() {
  let i = 0;
  while (true) {
    i++;
    yield i;
  }
})();

export type DecodingSchema = "base64" | "raw";

export class StolenDataEntry extends EventEmitter {
  public isIAB = false;
  // public iab: TCModel | null = null;
  public id: number;
  private marked = false;
  public classification: keyof typeof Classifications;
  public decoding_applied: DecodingSchema = "raw";
  public decodings_available: DecodingSchema[] = ["raw"];

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
    if (isBase64(value)) {
      this.decodings_available.push("base64");
    }
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

  get isMarked() {
    return this.marked;
  }

  hasValue(value: string) {
    return this.value === value;
  }

  static parseValue(value: unknown): string | Record<string, unknown> {
    if (isBase64JSON(value)) {
      return StolenDataEntry.parseValue({ base64: JSON.parse(atob(value)) });
    }
    if (value === undefined) {
      return "";
    }
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
      const searchParams = Object.fromEntries(
        ((url.searchParams as unknown) as {
          entries: () => Iterable<[string, string]>;
        }).entries()
      );
      if (typeof hash !== "object" && Object.keys(searchParams).length === 0) {
        return value; // just a string;
      }
      const object = {
        [Symbol.for("originalString")]: value, // so it doesn't appear raw in the table but can be easily retrieved later
        host: url.host,
        path: url.pathname,
        searchParams,
        ...(hash === "" ? {} : typeof hash === "string" ? { hash } : hash),
      };
      return object;
    } else if (value === null) {
      return "null";
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

  mark() {
    const had_been_marked_before = this.marked;
    this.marked = true;
    if (!had_been_marked_before) {
      this.emit("change");
    }
  }

  unmark() {
    const had_been_marked_before = this.marked;
    this.marked = false;
    if (had_been_marked_before) {
      this.emit("change");
    }
  }

  toggleMark() {
    if (this.marked) {
      this.unmark();
    } else {
      this.mark();
    }
  }

  private classify(): keyof typeof Classifications {
    let result: keyof typeof Classifications;
    if (this.exposesOrigin()) {
      result = "history";
    } else {
      result = "id";
    }
    return result;
  }

  isRelatedToID() {
    return this.request.stolenData.some(
      (entry) => entry.classification == "id"
    );
  }

  matchesHAREntry(har: HAREntry): boolean {
    return this.request.matchesHAREntry(har);
  }

  getValuePreview(key = ""): string {
    const value = this.getParsedValue(key);
    const str =
      typeof value === "object" && value[Symbol.for("originalString")]
        ? (value[Symbol.for("originalString")] as string)
        : value.toString();
    if (typeof value !== "object" && this.classification == "id") {
      return maskString(value, 1 / 3, ID_PREVIEW_MAX_LENGTH);
    } else if (
      typeof value === "object" &&
      value[Symbol.for("originalString")]
    ) {
      return value[Symbol.for("originalString")] as string;
    } else {
      return str;
    }
  }

  getUniqueKey() {
    return this.request.shorthost + ";" + this.name + ";" + this.value;
  }

  exposesOrigin(): boolean {
    const result = [this.value, decodeURIComponent(this.value)].some(
      (haystack) =>
        haystack.includes(getshorthost(this.request.origin)) ||
        (this.request.originalPathname !== "/" &&
          haystack.includes(this.request.originalPathname))
    );
    return result;
  }

  autoMark() {
    if (
      this.classification == "history" ||
      ((this.source === "cookie" ||
        this.name.toLowerCase().includes("id") ||
        this.name.toLowerCase().includes("cookie") ||
        this.name.toLowerCase().includes("ga") ||
        this.name.toLowerCase().includes("ses") ||
        this.name.toLowerCase().includes("fb")) &&
        this.value.length > MIN_COOKIE_LENGTH_FOR_AUTO_MARK)
    ) {
      if (
        (this.request.shorthost.includes("google") ||
          this.request.shorthost.includes("youtube")) &&
        this.name == "CONSENT"
      ) {
        // this cookie contains "YES" and might distract the person looking at it into thinking i gave consent on the reported site
        return;
      }
      this.mark();
    }
  }
}
