import React, { useEffect, useState } from "react";
import { HAREntry } from "../extended-request";
import { StolenDataEntry } from "../stolen-data-entry";
import { getshorthost, unique } from "../util";

function handleNewFile(
  element: HTMLInputElement,
  entries: StolenDataEntry[],
  setFiltered: (Blob) => void
): void {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const content = JSON.parse(reader.result as string);
    content.log.entries = content.log.entries.filter((har_entry: HAREntry) =>
      entries.some((entry) => entry.matchesHAREntry(har_entry))
    );
    setFiltered(
      new Blob([JSON.stringify(content)], { type: "application/json" })
    );
  });
  reader.readAsText(element.files[0]);
}

function generateFakeHAR(entries: StolenDataEntry[]) {
  const requests = entries
    .sort((entry1, entry2) => entry2.getPriority() - entry1.getPriority())
    .map((entry) => entry.request);
  return {
    log: {
      version: "1.2",
      creator: {
        name: "Firefox",
        version: "94.0",
      },
      browser: {
        name: "Firefox",
        version: "94.0",
      },
      pages: [
        {
          startedDateTime: "2021-11-08T20:27:23.195+01:00",
          id: "page_1",
          title: "HAR DUmp",
          pageTimings: {
            onContentLoad: 467,
            onLoad: 4226,
          },
        },
      ],
      entries: unique(requests).map((r) => r.toHAR()),
    },
  };
}

export default function HARConverter({
  entries,
}: {
  entries: StolenDataEntry[];
}) {
  const [filtered, setFiltered] = useState<Blob | null>(null);
  const [filename, setFilename] = useState("");
  const [fakeHAR, setFakeHAR] = useState<ReturnType<typeof generateFakeHAR>>();
  useEffect(() => {
    setFakeHAR(generateFakeHAR(entries));
  }, []);

  return (
    <div>
      <input
        type="file"
        accept=".har"
        onChange={(e) => {
          setFilename(e.target.files[0].name);
          handleNewFile(e.target, entries, setFiltered);
        }}
      />
      {(filtered && (
        <a
          href={URL.createObjectURL(filtered)}
          download={filename.replace(".har", "-filtered.har")}
        >
          Pobierz wyfiltrowany HAR
        </a>
      )) ||
        null}
      <a
        href={URL.createObjectURL(
          new Blob([JSON.stringify(fakeHAR)], { type: "application/json" })
        )}
        download={`${getshorthost(
          entries[0].request.originalURL
        )}-${new Date().toJSON()}-trimmed.har`}
      >
        Pobierz "zfałszowany" HAR
      </a>
    </div>
  );
}
