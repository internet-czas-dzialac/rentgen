import { Classifications, StolenDataEntry } from '../stolen-data-entry';

export function DataPreview({
    entries,
    refresh,
}: {
    entries: StolenDataEntry[];
    refresh: () => void;
}) {
    // currently not used, maybe scraped entirely in the future
    return (
        <table>
            <thead>
                <tr>
                    <th>Adres docelowy</th>
                    <th>Źródło danych</th>
                    <th>Treść danych</th>
                    <th>Klasyfikacja</th>
                </tr>
            </thead>
            <tbody>
                {entries.map((entry) => (
                    <tr
                        key={entry.id}
                        style={{
                            backgroundColor: entry.classification == 'id' ? 'yellow' : 'white',
                        }}
                    >
                        <td>{entry.request.shorthost}</td>
                        <td style={{ overflowWrap: 'anywhere' }}>
                            {entry.source}:{entry.name}
                        </td>
                        <td
                            style={{
                                width: '400px',
                                overflowWrap: 'anywhere',
                                backgroundColor: entry.isRelatedToID() ? '#ffff0054' : 'white',
                            }}
                        >
                            {entry.getValuePreview()}
                            {/* always gonna have
                one key, because unwrapEntry is called above */}
                        </td>
                        <td>
                            <select
                                value={entry.classification}
                                onChange={(e) => {
                                    entry.classification = e.target
                                        .value as keyof typeof Classifications;
                                    refresh();
                                }}
                            >
                                {[
                                    ['history', 'Historia przeglądania'],
                                    ['id', 'Identyfikator internetowy'],
                                    ['location', 'Lokalizacja'],
                                ].map(([key, name]) => (
                                    <option key={key} value={key}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
