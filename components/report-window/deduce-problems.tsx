import { RequestCluster } from '../../request-cluster';
import { ParsedAnswers } from './parse-answers';
import NoInformationAtAllProblem from './problems/no-information-at-all';
import { Problem } from './problems/problem';
import { UnlawfulCookieAccess } from './problems/unlawful-cookies';

export default function deduceProblems(
   answers: ParsedAnswers,
   clusters: Record<string, RequestCluster>
): Problem[] {
   const problems = [];
   if (answers.popup_type === 'none') {
      problems.push(new NoInformationAtAllProblem(answers, clusters));
   }
   if (UnlawfulCookieAccess.qualifies(answers, Object.values(clusters))) {
      problems.push(new UnlawfulCookieAccess(answers, clusters));
   }
   return problems;
}
