import { RequestCluster } from '../../request-cluster';
import { ParsedAnswers } from './parse-answers';
import NoInformationAtAllProblem from './problems/no-information-at-all';
import { Problem } from './problems/problem';
import { TransferOutsideEU } from './problems/transfer-outside-eu';
import { UnknownLegalBasis } from './problems/unknown-legal-basis';
import { UnlawfulCookieAccess } from './problems/unlawful-cookies';

export default function deduceProblems(
    answers: ParsedAnswers,
    clusters: Record<string, RequestCluster>
): Problem[] {
    return [NoInformationAtAllProblem, UnlawfulCookieAccess, UnknownLegalBasis, TransferOutsideEU]
        .map((c) => new c(answers, clusters))
        .filter((p) => p.qualifies());
}
