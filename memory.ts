import ExtendedRequest from './extended-request';
import { getshorthost, makeThrottle } from './util';
import { RequestCluster } from './request-cluster';
import { SaferEmitter } from './safer-emitter';

function setDomainsNumber(counter: number, tabId: number) {
    browser.browserAction.setBadgeText({ text: counter < 0 ? '0' : counter.toString(), tabId });
    browser.browserAction.setTitle({
        title: 'Rentgen',
        tabId,
    });
}

export default class Memory extends SaferEmitter {
    origin_to_history = {} as Record<string, Record<string, RequestCluster>>;
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
        this.emit('change', shorthost);

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

    emit(eventName: string, data = 'any'): boolean {
        setTimeout(() => super.emit(eventName, data), 0);
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
