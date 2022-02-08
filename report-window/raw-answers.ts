export type HostRawAnswers = {
    [key: `${string}|present`]:
        | 'not_mentioned'
        | 'not_before_making_a_choice'
        | 'mentioned_in_policy'
        | 'mentioned_in_popup';
    [key: `${string}|legal_basis_type`]: 'consent' | 'legitimate_interest' | 'not_mentioned';
    [key: `${string}|consent`]:
        | 'claims_consent_but_sends_before_consent'
        | 'claims_consent_but_there_was_no_easy_refuse'
        | 'none';
    [key: `${string}|legitimate_interest_activity_specified`]: 'precise' | 'vague' | 'no';
    [key: `${string}|legitimate_interest_description`]: string;
    [key: `${string}|outside_eu`]: 'yes' | 'no' | 'not_sure';
};

export type BasicRawAnswers = {
    zaimek: 0 | 1 | 2 | 3;
    is_incognito_different: [] | ['incognito_is_the_same'];
    policy_readable: 'yes' | 'vague' | 'cant_find';
    popup_action: 'none' | 'closed_popup' | 'accept_all' | 'deny_all' | 'other';
} & (
    | ({
          popup_type: 'passive_popup';
          cookie_wall: 'yes' | 'no';
          rejection_is_hard: undefined;
          administrator_identity_available_before_choice: undefined;
      } & (
          | {
                mentions_passive_consent?: 'yes';
                passive_consent_description: string;
            }
          | {
                mentions_passive_consent?: 'no';
                passive_consent_description: undefined;
            }
      ))
    | {
          popup_type: 'some_choice';
          rejection_is_hard: 'yes' | 'no';
          administrator_identity_available_before_choice: 'yes' | 'no';
          cookie_wall: undefined;
          passive_consent_description: undefined;
          mentions_passive_consent: undefined;
      }
    | {
          popup_type: 'none' | 'page';
          cookie_wall: undefined;
          passive_consent_description: undefined;
          mentions_passive_consent: undefined;
          rejection_is_hard: undefined;
          administrator_identity_available_before_choice: undefined;
      }
);

type RawAnswers = BasicRawAnswers & HostRawAnswers;

export default RawAnswers;
