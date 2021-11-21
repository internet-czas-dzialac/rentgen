import { EventEmitter } from "events";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export type Unpromisify<T> = T extends Promise<infer R> ? R : T;
export type Unarray<T> = T extends Array<infer R> ? R : T;

export type Tab = Unarray<Unpromisify<ReturnType<typeof browser.tabs.query>>>;
export type Request = {
  cookieStoreId?: string;
  documentUrl?: string; // RL of the document in which the resource will be loaded. For example, if the web page at "https://example.com" contains an image or an iframe, then the documentUrl for the image or iframe will be "https://example.com". For a top-level document, documentUrl is undefined.
  frameId: number;
  incognito?: boolean;
  method: string;
  originUrl: string;
  parentFrameId: number;
  proxyInfo?: {
    host: string;
    port: number;
    type: string;
    username: string;
    proxyDNS: boolean;
    failoverTimeout: number;
  };
  requestHeaders?: { name: string; value?: string; binaryValue?: number[] }[];
  requestId: string;
  tabId: number;
  thirdParty?: boolean;
  timeStamp: number;
  type: string;
  url: string; // the target of the request;
  urlClassification?: { firstParty: string[]; thirdParty: string[] };
};

export function getshorthost(host: string) {
  return host
    .replace(/^.*:\/\//, "")
    .replace(/\/.*$/, "")
    .split(".")
    .slice(-2)
    .join(".");
}

export function useEmitter(
  e: EventEmitter
): [number, Dispatch<SetStateAction<number>>] {
  const [counter, setCounter] = useState<number>(0);
  useEffect(() => {
    const callback = () => {
      setCounter((counter) => counter + 1);
    };
    e.on("change", callback);
    return () => {
      e.removeListener("change", callback);
    };
  }, []);
  return [counter, setCounter];
}

export function parseCookie(cookie: string): Record<string, string> {
  return cookie
    .split(";")
    .map((l) => l.split("="))
    .reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value,
      }),
      {}
    );
}

export async function getTabByID(id: number) {
  const tabs = await browser.tabs.query({ currentWindow: true });
  return tabs.find((tab) => tab.id == id);
}

export function parseToObject(str: unknown): Record<string, unknown> {
  if (typeof str === "string") {
    return JSON.parse(str);
  } else if (typeof str == "object") {
    return str as Record<string, unknown>;
  }
}

export function isJSONObject(
  str: unknown
): str is Record<string, unknown> | string | number {
  try {
    return JSON.stringify(parseToObject(str))[0] == "{";
  } catch (e) {
    return false;
  }
}

export function isURL(str: unknown): str is string {
  try {
    return !!(typeof str === "string" && new URL(str));
  } catch (e) {
    return false;
  }
}

export function hyphenate(str: string): string {
  return str.replace(/[_\[A-Z]/g, `${String.fromCharCode(173)}$&`);
}

export function unique<T>(array: T[]): Array<T> {
  return Array.from(new Set<T>(array));
}

export function allSubhosts(host: string) {
  const parts = host.split(".");
  const result = [];
  for (let i = 0; i < parts.length - 2; i++) {
    result.push(parts.slice(i).join("."));
  }
  return result;
}

export function reduceConcat<T>(a: T[], b: T[]): T[] {
  return a.concat(b);
}

export function getDate() {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

export function toBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const FR = new FileReader();
    FR.addEventListener("load", (e) => {
      resolve(e.target.result as string);
    });
    FR.readAsDataURL(file);
  });
}

export function makeThrottle(interval: number) {
  let last_emit = 0;
  function emit(callback: () => void) {
    if (Date.now() - last_emit > interval) {
      callback();
      last_emit = Date.now();
      return true;
    } else {
      return false;
    }
  }
  return function (callback: () => void) {
    if (!emit(callback)) {
      setTimeout(() => emit(callback), interval);
    }
  };
}
