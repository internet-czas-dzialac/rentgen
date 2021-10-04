import { EventEmitter } from "events";
import { useEffect, useState } from "react";

export type Unpromisify<T> = T extends Promise<infer R> ? R : T;
export type Unarray<T> = T extends Array<infer R> ? R : T;

export type Tab = Unarray<Unpromisify<ReturnType<typeof browser.tabs.query>>>;
export type Request = Parameters<
  Parameters<typeof browser.webRequest.onBeforeSendHeaders.addListener>[0]
>[0];

export function getshorthost(host: string) {
  return host.split(".").slice(-2).join(".");
}

export function useEmitter(e: EventEmitter) {
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
  return counter;
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
