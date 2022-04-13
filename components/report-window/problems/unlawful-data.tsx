import { RequestCluster } from '../../../request-cluster';
import { ExplainerKey } from '../explainers';
import { ParsedAnswers, ParsedHostAnswers } from '../parse-answers';
import { v } from '../verbs';
import { Problem } from './problem';

type UnlawfulDataClassification = 'no_purpose';

export function classifyUnlawfulData(
   hostAnswers: ParsedHostAnswers,
   cluster: RequestCluster
): UnlawfulDataClassification {
   if (hostAnswers.present == 'not_mentioned' && hostAnswers.was_processing_necessary == 'no') {
      return 'no_purpose';
   }
}

export class UnlawfulData extends Problem {
   static qualifies(answers: ParsedAnswers, clusters: RequestCluster[]): boolean {}
   getEmailContent() {
      const _ = (key: string) => v(key, this.answers.zaimek);
      return (
         <>
            <h2>Przetwarzanie danych osobowych bez ważnej podsawy prawnej</h2>
            <p>
               {_('Moje')} dane osobowe zostały ujawnione podmiotom, które są właścicielami domen:
            </p>
            {this.getRangeDescription()}
         </>
      );
   }
   getNecessaryExplainers() {
      return [] as ExplainerKey[];
   }
}
