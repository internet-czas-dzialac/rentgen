import { Classifications, StolenDataEntry } from "./stolen-data-entry";

export default class Mark {
  classification: keyof typeof Classifications;
  constructor(public entry: StolenDataEntry, public key: string) {
    this.classification = entry.classification;
  }

  getParsedValue() {
    return this.entry.getParsedValue(this.key);
  }

  get shorthost() {
    return this.entry.request.shorthost;
  }

  get source() {
    return this.entry.source;
  }

  get name() {
    return this.entry.name;
  }

  get originalURL() {
    return this.entry.request.originalURL;
  }

  get valuePreview(): string {
    return this.entry.getValuePreview(this.key);
  }
}
