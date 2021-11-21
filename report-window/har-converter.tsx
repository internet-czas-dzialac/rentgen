import React, { useEffect, useState } from "react";
import { HAREntry } from "../extended-request";
import Mark from "../mark";
import { getshorthost, unique } from "../util";

function handleNewFile(
  element: HTMLInputElement,
  marks: Mark[],
  setFiltered: (Blob) => void
): void {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const content = JSON.parse(reader.result as string);
    content.log.entries = content.log.entries.filter((har_entry: HAREntry) =>
      marks.some((mark) => mark.entry.matchesHAREntry(har_entry))
    );
    setFiltered(
      new Blob([JSON.stringify(content)], { type: "application/json" })
    );
  });
  reader.readAsText(element.files[0]);
}

function generateFakeHAR(marks: Mark[]) {
  const requests = marks.map((mark) => mark.entry.request);
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

export default function HARConverter({ marks }: { marks: Mark[] }) {
  const [filtered, setFiltered] = useState<Blob | null>(null);
  const [filename, setFilename] = useState("");
  const [fakeHAR, setFakeHAR] = useState<ReturnType<typeof generateFakeHAR>>();
  useEffect(() => {
    setFakeHAR(generateFakeHAR(marks));
  }, []);

  return (
    <div>
      <input
        type="file"
        accept=".har"
        onChange={(e) => {
          setFilename(e.target.files[0].name);
          handleNewFile(e.target, marks, setFiltered);
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
          marks[0].originalURL
        )}-${new Date().toJSON()}-trimmed.har`}
      >
        Pobierz "zfałszowany" HAR
      </a>
    </div>
  );
}
