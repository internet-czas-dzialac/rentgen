import { EventEmitter } from "events";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Memory from "./memory";

export type Unpromisify<T> = T extends Promise<infer R> ? R : T;
export type Unarray<T> = T extends Array<infer R> ? R : T;

export type Tab = Unarray<Unpromisify<ReturnType<typeof browser.tabs.query>>>;
export type Request = Parameters<
  Parameters<typeof browser.webRequest.onBeforeSendHeaders.addListener>[0]
>[0];

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

export function unique(array: string[]) {
  return Array.from(new Set(array));
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
