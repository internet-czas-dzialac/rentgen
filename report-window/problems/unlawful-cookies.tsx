import { RequestCluster } from '../../request-cluster';
import { ExplainerKey } from '../explainers';
import { ParsedAnswers } from '../parse-answers';
import { v } from '../verbs';
import { Problem } from './problem';

export class UnlawfulCookieAccess extends Problem {
   getNecessaryExplainers(): ExplainerKey[] {
      return [];
   }
   getEmailContent() {
      const cookie_clusters = Object.values(this.clusters).filter((c) => c.hasMarkedCookies());
      const unnecessary_hosts = Object.entries(this.answers.hosts)
         .filter(([, answers]) => answers.was_processing_necessary === 'no')
         .map(([host]) => host);
      const maybe_unnecessary_hosts = Object.entries(this.answers.hosts)
         .filter(([, answers]) => answers.was_processing_necessary === 'not_sure')
         .map(([host]) => host);
      const _ = (key: string) => v(key, this.answers.zaimek);
      return (
         <>
            <h2>Dostęp do cookies niezgodny z ustawą Prawo Telekomunikacyjne</h2>
            <p>
               Państwa strona dokonała odczytu plików Cookie zapisanych na dysku twardym mojego
               komputera. Dotyczy to plików cookie przypisanych do domen:
            </p>
            <ul>
               {cookie_clusters.map((cluster, index) => {
                  const names = cluster
                     .getMarkedEntries()
                     .filter((e) => e.source === 'cookie')
                     .map((e) => e.name);

                  return (
                     <li>
                        {cluster.id} ({names.length > 1 ? 'pliki' : 'plik'}{' '}
                        {names.map((name, index) => {
                           return (
                              <>
                                 {index > 0 ? ', ' : ''}
                                 {name}
                              </>
                           );
                        })}
                        ){index === cookie_clusters.length - 1 ? '.' : ';'}
                     </li>
                  );
               })}
            </ul>
            <p>
               Zgodnie z treścią Art. 173.{' '}
               <a href="https://isap.sejm.gov.pl/isap.nsf/download.xsp/WDU20041711800/U/D20041800Lj.pdf">
                  ustawy Prawo Telekomunikacyjne
               </a>
               , strona może pozyskać dostęp do treści plików cookies pod warunkiem spełnienia
               jednego z następujących warunków:
            </p>
            <ol>
               <li>
                  Użytkownik wyraził zgodę na takie przetwarzanie danych <em>po</em> tym, jak został
                  poinformowany bezpośrednio o celu uzyskania dostępu do tej informacji;
               </li>
               <li>
                  Dostęp do treści plików cookies jest konieczny do dostarczania usługi świadczonej
                  drogą elektroniczną zażądanej przez użytkownika.
               </li>
            </ol>
            {(() => {
               if (this.answers.popup_type == 'none' || this.answers.popup_type == 'page') {
                  return (
                     <p>
                        Jako, że strona nie pytała {_('mnie')} nigdy o zgodę, nie jest spełniony
                        warunek 1.
                     </p>
                  );
               } else if (this.answers.popup_type === 'passive_popup') {
                  return (
                     <p>
                        Państwa strona nie dała mi nigdy faktycznego wyboru dotyczacego wyrażenia
                        lub odmówienia zgody na takie przetwarzanie danych osobowych, dlatego nie
                        jest spełniony warunek 1.{' '}
                        {this.answers.mentions_passive_consent ? (
                           <>
                              Zgody wyrażonej w sposób bierny lub milczący nie można uznać za ważną
                              w świetle obowiązujących przepisów rozporządzenia 2016/679. Dlatego
                              zaniechanie zmiany ustawień przeglądarki lub po prostu korzystanie ze
                              strony nie stanowi ważnej zgody. Takie jest{' '}
                              <a href="https://assets.midline.pl/pisma/2021-12-16%20odpowiedz%20UODO%20na%20skarg%C4%99%20i(n)Secure.pdf">
                                 stanowisko polskiego UODO
                              </a>
                              .
                           </>
                        ) : (
                           ''
                        )}
                     </p>
                  );
               } else if (this.answers.popup_type === 'some_choice') {
                  if (this.answers.popup_action === 'none') {
                     return (
                        <p>
                           Nie {_('wyraziłem')} zgody na takie przetwarzanie {_('moich')} danych
                           osobowych. W okienku pytającym o zgodję nic nie {_('kliknąłem')}. Nie
                           jest zatem spełniony warunek 1.
                        </p>
                     );
                  } else if (this.answers.popup_action === 'closed_popup') {
                     return (
                        <p>
                           Nie {_('wyraziłem')} zgody na takie przetwarzanie {_('moich')} danych
                           osobowych. {this.answers.popup_closed_how.trim()}
                           {this.answers.popup_closed_how.trim().at(-1) != '.' ? '.' : ''} Takiego
                           działania nie można uznać za ważną zgodę na przetwarzanie danych
                           osobowych, gdyż nie spełnia warunku jednoznaczności opisanego w Art. 4,
                           pkt 11 RODO. Nie jest zatem spełniony warunek 1.
                        </p>
                     );
                  } else if (this.answers.popup_action == 'deny_all') {
                     return (
                        <p>
                           {this.answers.popup_deny_all_how.trim()}
                           {this.answers.popup_closed_how.trim().at(-1) != '.' ? '.' : ''} Zatem nie
                           jest spełniony warunek 1.
                        </p>
                     );
                  }
               }
            })()}
            {unnecessary_hosts.length > 0 ? (
               <p>
                  W {_('mojej')} ocenie odczytywanie przez Państwa stronę treści plików cookies z{' '}
                  {unnecessary_hosts.join(', ')} nie jest konieczne do wyświetlenia treści Państwa
                  strony, dlatego nie jest dla nich spełniony warunek 2. Jeżeli Państwa zdaniem jest
                  inaczej, {_('proszę')} o wskazanie, co jest źródłem tej konieczności i co odróżnia
                  Państwa stronę od wielu innych stron, które realizują te same funkcjonalności{' '}
                  <em>bez</em> korzystania z plików Cookie.
               </p>
            ) : (
               ''
            )}
            <p>
               {_('Proszę')} o wskazanie, czy być może stosowali Państwo inną podstawę prawną do
               takiego przetwarzania {_('moich')} danych osobowych, czy przetwarzali je państwo bez
               ważnej podstawy prawnej?
            </p>
            <p>
               {_('Proszę')} też o wskazanie, czy dostęp do treści plików cookie z
               {maybe_unnecessary_hosts.join(', ')} jest konieczny do poprawnego działania strony?
               Jeżeli tak, to {_('proszę')} wskazać, w jaki sposób. Co sprawia, że strona nie może
               działać bez nich?
            </p>
         </>
      );
   }
   static qualifies(answers: ParsedAnswers, clusters: RequestCluster[]): boolean {
      // są cookiesy, nie było zgody, nie są konieczne do działania strony
      const cookie_clusters = Object.values(clusters).filter((c) => c.hasMarkedCookies());
      return cookie_clusters.some((cluster) => {
         const hostAnswers = answers.hosts[cluster.id];
         return (
            (hostAnswers.present == 'not_mentioned' ||
               hostAnswers.present == 'not_before_making_a_choice' ||
               ['none', 'closed_popup', 'deny_all'].includes(hostAnswers.popup_action)) &&
            hostAnswers.was_processing_necessary != 'yes'
         );
      });
   }
}
