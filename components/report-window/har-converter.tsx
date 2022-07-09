import React from 'react';
import { HAREntry } from '../../extended-request';
import { StolenDataEntry } from '../../stolen-data-entry';
import { getshorthost, unique } from '../../util';

function handleNewFile(
    element: HTMLInputElement,
    entries: StolenDataEntry[],
    setFiltered: (arg0: Blob) => void
): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
        const content = JSON.parse(reader.result as string);
        content.log.entries = content.log.entries.filter((har_entry: HAREntry) =>
            entries.some((entry) => entry.matchesHAREntry(har_entry))
        );
        setFiltered(new Blob([JSON.stringify(content)], { type: 'application/json' }));
    });
    const file = element?.files?.[0];
    if (!file) throw new Error('file empty?');
    reader.readAsText(file);
}

function generateFakeHAR(entries: StolenDataEntry[]) {
    const requests = unique(entries.map((entry) => entry.request))
        .sort((request1, request2) => {
            if (request1.shorthost < request2.shorthost) {
                return -1;
            } else if (request1.shorthost > request2.shorthost) {
                return 1;
            } else {
                return request2.getBalancedPriority() - request1.getBalancedPriority();
            }
        })
        .filter((_, index, array) => {
            if (index == 0) return true;
            if (array[index].shorthost == array[index - 1].shorthost) {
                return false;
            }
            return true;
        })
        .sort((entry1, entry2) => entry2.getBalancedPriority() - entry1.getBalancedPriority());

    return {
        log: {
            version: '1.2',
            creator: {
                name: 'Firefox',
                version: '94.0',
            },
            browser: {
                name: 'Firefox',
                version: '94.0',
            },
            pages: [
                {
                    startedDateTime: '2021-11-08T20:27:23.195+01:00',
                    id: 'page_1',
                    title: 'HAR DUmp',
                    pageTimings: {
                        onContentLoad: 467,
                        onLoad: 4226,
                    },
                },
            ],
            entries: requests.map((r) => r.toHAR()),
        },
    };
}

export default function HARConverter({ entries }: { entries: StolenDataEntry[] }) {
    const [filtered, setFiltered] = React.useState<Blob | null>(null);
    const [filename, setFilename] = React.useState('');
    const [fakeHAR, setFakeHAR] = React.useState<ReturnType<typeof generateFakeHAR>>();
    React.useEffect(() => {
        setFakeHAR(generateFakeHAR(entries));
    }, []);

    return (
        <div>
            <input
                type="file"
                accept=".har"
                onChange={(e) => {
                    const file = e.target?.files?.[0];
                    if (file) {
                        setFilename(file.name);
                        handleNewFile(e.target, entries, setFiltered);
                    }
                }}
            />
            {(filtered && (
                <a
                    href={URL.createObjectURL(filtered)}
                    download={filename.replace('.har', '-filtered.har')}
                >
                    Pobierz wyfiltrowany HAR
                </a>
            )) ||
                null}
            <a
                href={URL.createObjectURL(
                    new Blob([JSON.stringify(fakeHAR)], {
                        type: 'application/json',
                    })
                )}
                download={`${getshorthost(
                    entries[0].request.originalURL
                )}-${new Date().toJSON()}-trimmed.har`}
            >
                Pobierz "zredukowany" HAR
            </a>
        </div>
    );
}
