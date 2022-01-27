import ExtendedRequest from './extended-request';
import { getshorthost, makeThrottle } from './util';
import { EventEmitter } from 'events';
import { RequestCluster } from './request-cluster';

export default class Memory extends EventEmitter {
    origin_to_history = {} as Record<string, Record<string, RequestCluster>>;
    private throttle = makeThrottle(200);
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
        this.emit('change');
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
                const extendedRequest = ExtendedRequest.by_id[
                    request.requestId
                ].addHeaders(request.requestHeaders || []);
                this.register(extendedRequest);
            },
            { urls: ['<all_urls>'] },
            ['requestHeaders']
        );
    }

    emit(eventName: string, immediate = false) {
        try {
            if (immediate) {
                super.emit(eventName);
                return;
            } else {
                this.throttle(() => super.emit(eventName));
            }
            return true;
        } catch (e) {
            //   debugger;
            console.error(e);
        }
    }

    getClustersForOrigin(origin: string): Record<string, RequestCluster> {
        return this.origin_to_history[origin] || {};
    }

    async removeCookiesFor(origin: string, shorthost?: string): Promise<void> {
        if (shorthost) {
            const cookies = await browser.cookies.getAll({ domain: shorthost });
            for (const cookie of cookies) {
                console.log(
                    'removing cookie',
                    cookie.name,
                    'from',
                    cookie.domain
                );
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
    return (browser.extension.getBackgroundPage().window as any)
        .memory as Memory;
}
