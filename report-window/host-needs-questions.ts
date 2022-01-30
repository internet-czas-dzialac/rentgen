import { EmailTemplate3Config } from './email-template-3';

export function hostNeedsQuestions({
    presence,
    legal_basis_type,
    consent_problems,
    legitimate_interest_activity_description,
    legitimate_interest_activity_specified,
}: EmailTemplate3Config['hosts_settings'][string]) {
    if (presence == 'not_mentioned') {
        return false;
    }
    if (legal_basis_type == 'not_mentioned') {
        return false;
    }
    if (legal_basis_type == 'consent' && consent_problems !== 'null') {
        return false;
    }
    if (
        legitimate_interest_activity_specified !== 'null' &&
        legitimate_interest_activity_specified !== 'vague'
    ) {
        return false;
    }
    if (
        legal_basis_type == 'legitimate_interest' &&
        legitimate_interest_activity_description != ''
    ) {
        return false;
    }
    return true;
}
