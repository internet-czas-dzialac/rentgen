import { EventEmitter } from 'events';
import React from 'react';

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
    const parts = host
        .replace(/^.*:\/\//, '')
        .replace(/\/.*$/, '')
        .split('.');
    let lookback = !['co', 'com'].includes(parts.at(-2)) ? -2 : -3;
    if (parts.at(-2) == 'doubleclick' || parts.at(-2) == 'google') {
        lookback = -4; // to distinguish between google ads and stats
    } else if (parts.at(-2) == 'google') {
        lookback = -3; // to distinguish various google services
    }
    return parts.slice(lookback).join('.');
}

export function useEmitter(
    e: EventEmitter
): [number, React.Dispatch<React.SetStateAction<number>>] {
    const [counter, setCounter] = React.useState<number>(0);
    React.useEffect(() => {
        const callback = () => {
            setCounter((counter) => counter + 1);
        };
        e.on('change', callback);
        return () => {
            e.removeListener('change', callback);
        };
    }, []);
    return [counter, setCounter];
}

export function parseCookie(cookie: string): Record<string, string> {
    return cookie
        .split(';')
        .map((l) => l.split('='))
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

export function parseToObject(str: unknown): Record<string | symbol, unknown> {
    let result: Record<string | symbol, unknown>;
    let original_string: string;
    if (typeof str === 'string') {
        original_string = str;
        result = JSON.parse(str);
    } else if (typeof str == 'object') {
        result = str as Record<string | symbol, unknown>;
        original_string = (result[Symbol.for('originalString')] as string) || JSON.stringify(str);
    }
    result[Symbol.for('originalString')] = original_string;
    return result;
}

export function isJSONObject(str: unknown): str is Record<string, unknown> | string | number {
    try {
        const firstChar = JSON.stringify(parseToObject(str))[0];
        return ['{', '['].includes(firstChar);
    } catch (e) {
        return false;
    }
}

export function isURL(str: unknown): str is string {
    try {
        return !!(typeof str === 'string' && new URL(str));
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
    const parts = host.split('.');
    const result = [];
    for (let i = 0; i < parts.length - 2; i++) {
        result.push(parts.slice(i).join('.'));
    }
    return result;
}

export function reduceConcat<T>(a: T[], b: T[]): T[] {
    return a.concat(b);
}

export function getDate() {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
        .getDate()
        .toString()
        .padStart(2, '0')}`;
}

export function toBase64(file: File): Promise<string> {
    return new Promise((resolve) => {
        const FR = new FileReader();
        FR.addEventListener('load', (e) => {
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

export function isSameURL(url1: string, url2: string): boolean {
    if (url1 === url2) {
        return true;
    }
    url1 = url1.replace(/^https?:\/\//, '').replace(/\/$/, '');
    url2 = url2.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return url1 === url2;
}

export function isBase64(s: string): boolean {
    try {
        atob(s);
        return true;
    } catch (e) {}
    return false;
}

export function isBase64JSON(s: unknown): s is string {
    return typeof s === 'string' && isBase64(s) && isJSONObject(atob(s));
}

export function flattenObject(
    obj: unknown,
    parser: (to_parse: unknown) => string | Record<string, unknown> = (id) => id.toString(),
    key = '',
    ret = [] as [string, string][],
    parsed = false
): [string, string][] {
    const prefix = key === '' ? '' : `${key}.`;
    if (Array.isArray(obj)) {
        if (obj.length == 1) {
            flattenObject(obj[0], parser, key, ret);
        } else {
            for (let i in obj) {
                flattenObject(obj[i], parser, prefix + i, ret);
            }
        }
    } else if (typeof obj === 'object') {
        for (const [subkey, value] of Object.entries(obj)) {
            flattenObject(value, parser, prefix + subkey, ret);
        }
    } else if (!parsed) {
        flattenObject(parser(obj), parser, key, ret, true);
    } else if (typeof obj === 'string') {
        ret.push([key, obj]);
    } else {
        throw new Error('Something went wrong when parsing ' + obj);
    }
    return ret;
}

export function flattenObjectEntries(
    entries: [string, unknown][],
    parser: (to_parse: unknown) => string | Record<string, unknown> = (id) => id.toString()
): [string, string][] {
    return flattenObject(Object.fromEntries(entries), parser);
}

export function maskString(
    str: string,
    max_fraction_remaining: number,
    max_chars_total: number
): string {
    const amount_of_chars_to_cut =
        str.length - Math.min(str.length * max_fraction_remaining, max_chars_total);
    if (amount_of_chars_to_cut == 0) {
        return str;
    }
    return (
        str.slice(0, str.length / 2 - amount_of_chars_to_cut / 2) +
        '(...)' +
        str.slice(str.length / 2 + amount_of_chars_to_cut / 2)
    );
}

export function safeDecodeURIComponent(s: string) {
    try {
        return decodeURIComponent(s);
    } catch (e) {
        return s;
    }
}

export function normalizeForClassname(string: string) {
    return string.replace(/[^a-z0-9]/gi, '-');
}
