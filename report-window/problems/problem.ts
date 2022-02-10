import { RequestCluster } from '../../request-cluster';
import { ExplainerKey } from '../explainers';
import { ParsedAnswers } from '../parse-answers';

export abstract class Problem {
   constructor(public answers: ParsedAnswers, public clusters: Record<string, RequestCluster>) {}

   getMarkedClusters() {
      return Object.values(this.clusters).filter((c) => c.hasMarks());
   }

   abstract getEmailContent(): JSX.Element;
   abstract getNecessaryExplainers(): ExplainerKey[];
}
