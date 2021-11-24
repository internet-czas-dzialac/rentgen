import React from "react";
import { Dispatch, SetStateAction } from "react";
import { toBase64 } from "../util";
import { EmailTemplate2Config } from "./email-template-2";

export default function EmailTemplate2Controls({
  config,
  setConfig,
}: {
  config: EmailTemplate2Config;
  setConfig: Dispatch<SetStateAction<EmailTemplate2Config>>;
}): JSX.Element {
  return (
    <div>
      <div>
        <label htmlFor="poup_type">Typ okienka o RODO:</label>
        <select
          id="poup_type"
          value={config.popup_type}
          onChange={(e) =>
            setConfig((v) => ({
              ...v,
              popup_type: e.target.value as EmailTemplate2Config["popup_type"],
            }))
          }
        >
          <option value="none">Brak jakiejkolwiek informacji</option>
          <option value="passive_cookie_banner">
            Pasywne powiadomienie o cookiesach
          </option>
          <option value="consent">Okienko z pytaniem o zgodę</option>
        </select>
      </div>
      {config.popup_type !== "none" ? (
        <div>
          <label htmlFor="popup_screenshot">Zrzut ekranu okienka o RODO:</label>
          <input
            {...{
              type: "file",
              id: "popup_screenshot",
              onChange: async (e) => {
                const popup_screenshot_base64 = await toBase64(
                  e.target.files[0]
                );
                setConfig((v) => ({
                  ...v,
                  popup_screenshot_base64,
                }));
              },
            }}
          />
        </div>
      ) : (
        ""
      )}
      {config.popup_type === "consent" ? (
        <div>
          <label htmlFor="acceptAllName">
            Tekst na przycisku do zatwierdzania wszystkich zgód:
          </label>
          <input
            {...{
              type: "text",
              value: config.popup_accept_all_text,
              onChange: (e) =>
                setConfig((v) => ({
                  ...v,
                  popup_accept_all_text: e.target.value,
                })),
            }}
          />
        </div>
      ) : (
        ""
      )}
      <div>
        <label htmlFor="popup_action">
          Czy coś klikn*ł*m w informacjach o RODO?
        </label>
        <select
          id="popup_action"
          value={config.popup_type}
          onChange={(e) =>
            setConfig((v) => ({
              ...v,
              popup_action: e.target
                .value as EmailTemplate2Config["popup_action"],
            }))
          }
        >
          <option value="ignored">Nic nie klin*ł*m</option>
          <option value="accepted">
            Kliknięte „{config.popup_accept_all_text}”
          </option>
        </select>
      </div>
      {config.popup_type !== "none" ? (
        <div>
          <input
            type="checkbox"
            id="popup_mentions_passive_consent"
            checked={config.popup_mentions_passive_consent}
            onChange={(e) =>
              setConfig((v) => ({
                ...v,
                popup_mentions_passive_consent: e.target.checked,
              }))
            }
          />
          <label htmlFor="popup_mentions_passive_consent">
            okienko wspomina o pasywnej zgodzie (np. „korzystając ze strony
            wyrażasz zgodę”)
          </label>
        </div>
      ) : (
        ""
      )}
      {config.popup_mentions_passive_consent ? (
        <div>
          <label htmlFor="popup_passive_consent_text">
            Jak okienko próbuje wmówić Ci, że wyrażasz zgodę? Przeklej z treści
            okienka:
          </label>
          <input
            id="popup_passive_consent_text"
            placeholder="Korzystając ze strony wyrażasz zgodę"
            value={config.popup_passive_consent_text}
            onChange={(e) =>
              setConfig((v) => ({
                ...v,
                popup_passive_consent_text: e.target.value,
              }))
            }
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
