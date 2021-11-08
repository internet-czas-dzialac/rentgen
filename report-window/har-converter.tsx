import React, { useState } from "react";
import { HAREntry } from "../extended-request";
import { StolenDataEntry } from "../stolen-data-entry";

function handleNewFile(
  element: HTMLInputElement,
  marked_entries: StolenDataEntry[],
  setFiltered: (Blob) => void
) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const content = JSON.parse(reader.result as string);
    content.log.entries = content.log.entries.filter((har_entry: HAREntry) =>
      marked_entries.some((stolen_entry) =>
        stolen_entry.matchesHAREntry(har_entry)
      )
    );
    setFiltered(
      new Blob([JSON.stringify(content)], { type: "application/json" })
    );
  });
  reader.readAsText(element.files[0]);
}

export default function HARConverter({
  marked_entries,
}: {
  marked_entries: StolenDataEntry[];
}) {
  const [filtered, setFiltered] = useState<Blob | null>(null);
  const [filename, setFilename] = useState("");
  return (
    <div>
      <input
        type="file"
        accept=".har"
        onChange={(e) => {
          setFilename(e.target.files[0].name);
          handleNewFile(e.target, marked_entries, setFiltered);
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
    </div>
  );
}
