import React from "react";

export default function Options({
  minValueLength,
  setMinValueLength,
  cookiesOnly,
  setCookiesOnly,
  cookiesOrOriginOnly,
  setCookiesOrOriginOnly,
}) {
  return (
    <fieldset>
      <h3>Zaawansowane ustawienia</h3>
      <label htmlFor="minValueLength">
        Pokazuj tylko wartości o długości co najmniej{" "}
      </label>
      <input
        type="number"
        id="minValueLength"
        value={minValueLength}
        onChange={(e) => setMinValueLength(parseInt(e.target.value))}
      />
      <br />
      <input
        type="checkbox"
        id="cookiesOnly"
        value={cookiesOnly}
        onChange={(e) => setCookiesOnly(e.target.checked)}
      />
      <label htmlFor="cookiesOnly">Pokazuj tylko dane z cookiesów</label>
      <br />
      <input
        type="checkbox"
        id="cookiesOrOriginOnly"
        value={cookiesOrOriginOnly}
        onChange={(e) => setCookiesOrOriginOnly(e.target.checked)}
      />
      <label htmlFor="cookiesOrOriginOnly">
        Pokazuj tylko dane z cookiesów lub z częścią historii przeglądania
      </label>
    </fieldset>
  );
}
