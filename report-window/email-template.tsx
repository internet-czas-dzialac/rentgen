import React, { useState } from "react";
import { RequestCluster } from "../request-cluster";
import { StolenDataEntry } from "../stolen-data-entry";
import EmailTemplate1 from "./email-template-1";
import EmailTemplate2 from "./email-template-2";

export default function EmailTemplate({
  entries,
  clusters,
  version,
}: {
  entries: StolenDataEntry[];
  clusters: Record<string, RequestCluster>;
  version: number;
}) {
  const [templateVersion, setTemplateVersion] = useState("2");
  return (
    <div>
      <select
        value={templateVersion}
        onChange={(e) => setTemplateVersion(e.target.value)}
      >
        <option value="1">wersja 1</option>
        <option value="2">wersja 2</option>
      </select>
      {templateVersion === "1" ? (
        <EmailTemplate1 {...{ entries, clusters, version }} />
      ) : (
        <EmailTemplate2 {...{ entries, clusters, version }} />
      )}
    </div>
  );
}
