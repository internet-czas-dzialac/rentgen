import { RequestCluster } from '../../request-cluster';
import { ExplainerKey } from '../explainers';
import { v } from '../verbs';
import { Problem } from './problem';

function formatRange(cluster: RequestCluster) {
   const parts = [] as string[];
   console.log(cluster);
   if (cluster.hasMarkedCookies()) {
      parts.push('mojego identyfikatora internetowego pozyskanego z Cookie');
   }
   if (cluster.exposesOrigin()) {
      parts.push('części mojej historii przeglądania');
   }
   return parts.join(' oraz ');
}

export default class NoInformationAtAllProblem extends Problem {
   getEmailContent() {
      const _ = (word: string) => v(word, this.answers.zaimek);
      return (
         <>
            <h2>Brak informacji na temat przetwarzania danych osobowych</h2>
            <p>
               {_('Moje')} dane osobowe zostały ujawnione podmiotom, które są właścicielami domen:
            </p>
            <ul>
               {this.getMarkedClusters().map((cluster) => (
                  <li key={cluster.id}>
                     {cluster.id} (w zakresie: {formatRange(cluster)})
                  </li>
               ))}
            </ul>
            <p>
               Na stronie brakuje jednak jakichkolwiek informacji o tym, jakie są cele przetwarzania
               takich danych oraz jakie są podstawy prawne takiego przetwarzania.
            </p>
            <p>Zwracam się zatem do Państwa z następującymi pytaniami:</p>
            <ul>
               <li>Jaka jest tożsamość właścicieli tych domen?</li>
               <li>Jaki jest cel takiego przetwarzania danych przez Państwa stronę?</li>
               <li>
                  Jaka jest podstawa prawna takiego przetwarzania moich danych osobowych przez
                  Państwa stronę?
               </li>
            </ul>
         </>
      );
   }
   getNecessaryExplainers() {
      const explainers = [] as Array<ExplainerKey>;

      if (
         this.getMarkedClusters().some((cluster) => {
            console.log(cluster);
            return cluster.hasMarkedCookies();
         })
      ) {
         explainers.push('cookies_are_pii');
      }
      return explainers;
   }
}
