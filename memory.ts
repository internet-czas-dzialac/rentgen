import ExtendedRequest from './extended-request';
import { getshorthost, makeThrottle } from './util';
import { EventEmitter } from 'events';
import { RequestCluster } from './request-cluster';

function setDomainsNumber(counter: number, tabId: number) {
    browser.browserAction.setBadgeText({ text: counter < 0 ? '0' : counter.toString(), tabId });
    browser.browserAction.setTitle({
        title: 'Rentgen',
        tabId,
    });
}

export default class Memory extends EventEmitter {
    origin_to_history = {} as Record<string, Record<string, RequestCluster>>;
    private throttle = makeThrottle(100);
    async register(request: ExtendedRequest) {
        await request.init();
        if (!request.isThirdParty()) {
            return;
        }
        if (!this.origin_to_history[request.origin]) {
            this.origin_to_history[request.origin] = {};
        }
        const shorthost = getshorthost(new URL(request.url).host);
        if (!this.origin_to_history[request.origin][shorthost]) {
            const cluster = new RequestCluster(shorthost);
            this.origin_to_history[request.origin][shorthost] = cluster;
        }
        this.origin_to_history[request.origin][shorthost].add(request);
        this.emit('change', false, shorthost, 'registered request(shorthost emit)');

        Object.values(this.getClustersForOrigin(request.origin)).some((cluster) =>
            cluster.hasCookies()
        )
            ? browser.browserAction.setBadgeBackgroundColor({ color: '#ff726b' })
            : browser.browserAction.setBadgeBackgroundColor({ color: '#ffb900' });

        setDomainsNumber(
            Object.values(this.getClustersForOrigin(request.origin)).length,
            request.tabId
        );
    }

    constructor() {
        super();

        browser.webRequest.onBeforeRequest.addListener(
            async (request) => {
                new ExtendedRequest(request);
            },
            { urls: ['<all_urls>'] },
            ['requestBody']
        );
        browser.webRequest.onBeforeSendHeaders.addListener(
            async (request) => {
                const extendedRequest = ExtendedRequest.by_id[request.requestId].addHeaders(
                    request.requestHeaders || []
                );
                this.register(extendedRequest);
            },
            { urls: ['<all_urls>'] },
            ['requestHeaders']
        );
    }

    private originalEmit(type: string, ...args: unknown[]) {
        let doError = type === 'error';

        let events = (this as any)._events;
        if (events !== undefined) doError = doError && events.error === undefined;
        else if (!doError) return false;

        // If there is no 'error' event listener then throw.
        if (doError) {
            let er;
            if (args.length > 0) er = args[0];
            if (er instanceof Error) {
                // Note: The comments on the `throw` lines are intentional, they show
                // up in Node's output if this results in an unhandled exception.
                throw er; // Unhandled 'error' event
            }
            // At least give some kind of context to the user
            let err = new Error('Unhandled error.' + (er ? ' (' + (er as any).message + ')' : ''));
            (err as any).context = er;
            throw err; // Unhandled 'error' event
        }

        let handler = events[type];
        if (handler === undefined) return false;
        if (typeof handler === 'function') {
            try {
                Reflect.apply(handler, this, args);
            } catch (error) {
                events[type] = undefined;
            }
        } else {
            let listeners = [...handler];

            listeners
                .filter((e) => {
                    try {
                        e.call;
                    } catch (error) {
                        return false;
                    }
                    return true;
                })
                .forEach((listener) => {
                    try {
                        Reflect.apply(listener, this, args);
                    } catch (error) {
                        console.error(error);
                        debugger;
                    }
                });
        }
        return true;
    }

    emit(eventName: string, immediate = false, data = 'any', reason: string): boolean {
        setTimeout(() => this.originalEmit(eventName, data), 0);
        return;
    }

    getClustersForOrigin(origin: string): Record<string, RequestCluster> {
        return this.origin_to_history[origin] || {};
    }

    async removeCookiesFor(origin: string, shorthost?: string): Promise<void> {
        if (shorthost) {
            const cookies = await browser.cookies.getAll({ domain: shorthost });
            for (const cookie of cookies) {
                console.log('removing cookie', cookie.name, 'from', cookie.domain);
                await browser.cookies.remove({
                    name: cookie.name,
                    url: `https://${cookie.domain}`,
                });
            }
        } else {
            const clusters = this.getClustersForOrigin(origin);

            await Promise.all(
                Object.values(clusters)
                    .filter((cluster) => !shorthost || cluster.id === shorthost)
                    .map((cluster) => this.removeCookiesFor(origin, cluster.id))
            );
        }
    }

    async removeRequestsFor(origin: string) {
        this.origin_to_history[origin] = {};
    }
}

export function init() {
    const memory = new Memory();

    (window as any).memory = memory;
}

export function getMemory(): Memory {
    return (browser.extension.getBackgroundPage().window as any).memory as Memory;
}
