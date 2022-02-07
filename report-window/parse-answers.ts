import RawAnswers, { BasicRawAnswers, HostRawAnswers } from './raw-answers';

export type RecordValue<T> = T extends Record<any, infer R> ? R : any;

export type ParsedHostAnswers =
    | {
          present: 'not_mentioned' | 'not_before_making_a_choice';
      }
    | ({
          present: 'mentioned_in_policy' | 'mentioned_in_popup';
      } & (
          | ({
                legal_basis_type: 'consent';
            } & (
                | {
                      consent_problems:
                          | 'claims_consent_but_sends_before_consent'
                          | 'claims_consent_but_there_was_no_easy_refuse';
                  }
                | { consent_problems: 'none'; outside_eu: 'yes' | 'no' | 'not_sure' }
            ))
          | ({
                legal_basis_type: 'legitimate_interest';
            } & (
                | {
                      legitimate_interest_activity_specified: 'no';
                  }
                | {
                      legitimate_interest_activity_specified: 'precise';
                      outside_eu: 'yes' | 'no' | 'not_sure';
                  }
                | {
                      legitimate_interest_activity_specified: 'vague';
                      legitimate_interest_description: string;
                  }
            ))
          | {
                legal_basis_type: 'not_mentioned';
            }
      ));

export type ParsedAnswers = BasicRawAnswers & { hosts: Record<string, ParsedHostAnswers> };

function parseHostAnswers(
    raw_answers: Record<keyof HostRawAnswers, string>
): Record<string, ParsedHostAnswers> {
    const result: Record<string, Record<string, string>> = {};
    for (const [key, value] of Object.entries(raw_answers)) {
        const [masked_host, attr] = key.split('|');
        const host = masked_host.replace(/_/g, '.');
        if (!result[host]) {
            result[host] = {} as ParsedHostAnswers;
        }
        result[host][attr] = value;
    }
    return result as Record<string, ParsedHostAnswers>;
}

export function parseAnswers({
    zaimek,
    is_incognito_different,
    policy_readable,
    popup_type,
    cookie_wall,
    passive_consent_description,
    mentions_passive_consent,
    rejection_is_hard,
    administrator_identity_available_before_choice,
    ...rest
}: RawAnswers): ParsedAnswers {
    return {
        zaimek,
        is_incognito_different,
        policy_readable,
        popup_type,
        cookie_wall,
        passive_consent_description,
        mentions_passive_consent,
        rejection_is_hard,
        administrator_identity_available_before_choice,
        hosts: parseHostAnswers(rest),
    } as RawAnswers;
}
