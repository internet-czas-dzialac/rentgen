function generateHostPage(
    host: string,
    index: number,
    all_hosts: string[]
): { title: string; elements: any[]; visibleIf: string } {
    function f(name: string, h = host) {
        return `${h.replace(/\./g, '_')}|${name}`;
    }
    const previous_host: string | null = index > 0 ? all_hosts[index - 1] : null;
    function defaultValue(name: string) {
        if (!previous_host) {
            return {};
        }
        return { defaultValueExpression: `{${f(name, previous_host)}}` };
    }
    return {
        title: host,
        elements: [
            {
                type: 'radiogroup',
                name: f('present'),
                isRequired: true,
                title: `Cel ujawnienia danych właścicielowi domeny ${host}`,
                ...defaultValue('present'),
                visibleIf: '{popup_type} != "none"',
                choices: [
                    {
                        value: 'not_mentioned',
                        text: 'nie jest podany nigdzie na stronie',
                        visibleIf: "{policy_readable} = 'yes' ",
                    },
                    {
                        value: 'not_before_making_a_choice',
                        text: 'nie jest podany w żadnym miejscu na stronie, do którego można się dostać bez podejmowania wyboru dotyczącego przetwarzania danych osobowych',
                    },
                    {
                        value: 'mentioned_in_policy',
                        text: 'jest podany w polityce prywatności',
                        visibleIf: "{policy_readable} = 'yes' ",
                    },

                    {
                        value: 'mentioned_in_popup',
                        text: 'jest podany w okienku RODO',
                        visibleIf: "{popup_type} != 'none' ",
                    },
                ],
            },
            {
                type: 'radiogroup',
                name: f('legal_basis_type'),
                ...defaultValue('legal_basis_type'),
                isRequired: true,
                title: `Podstawa prawna dla tego konkretnego celu`,
                visibleIf: `{${f('present')}} notempty and {${f(
                    'present'
                )}} != "not_mentioned" and {${f('present')}} != "not_before_making_a_choice"`,
                choices: [
                    { value: 'consent', text: 'to zgoda.' },
                    {
                        value: 'legitimate_interest',
                        text: 'to uzasadniony interes.',
                    },
                    { value: 'not_mentioned', text: 'nie jest wskazana nigdzie na stronie.' },
                ],
            },
            {
                type: 'radiogroup',
                name: f('consent_problems'),
                ...defaultValue('consent_problems'),
                isRequired: true,
                title: `Jak ma się ta podstawa prawna do stanu faktycznego?`,
                visibleIf: `{${f('legal_basis_type')}} = "consent"`,
                defaultValueExpression:
                    'iif({popup_action} = "none" or {popup_action} = "closed_popup", "claims_consent_but_sends_before_consent", iif({popup_action} = "accept_all" and {rejection_is_hard} = "yes", "claims_consent_but_there_was_no_easy_refuse", ""))',
                choices: [
                    {
                        value: 'claims_consent_but_sends_before_consent',
                        text: `Strona wysłała {moje} dane do ${host} zanim {wyraziłem} na to zgodę`,
                    },
                    {
                        value: 'claims_consent_but_there_was_no_easy_refuse',
                        text: '{Kliknąłem} przycisk od wyrażania zgody, ale w okienku o zgodę nie było natychmiastowo dostępnego przycisku do niewyrażenia zgody jednym kliknięciem',
                    },
                    { value: 'none', text: 'żadne z powyższych.' },
                ],
            },
            {
                type: 'radiogroup',
                name: f('legitimate_interest_activity_specified'),
                ...defaultValue('legitimate_interest_activity_specified'),
                isRequired: true,
                title: /* HTML */ `Czy administrator strony opisał szczegółowo, na czym polega
                uzasadniony interes w kontekście tego celu?`,
                visibleIf: `{${f('legal_basis_type')}} = "legitimate_interest"`,
                choices: [
                    {
                        value: 'precise',
                        text: /* HTML */ `Tak, wskazuje jasno na bieżące działania lub korzyści
                        wynikające z takiego przetwarzania danych.`,
                    },
                    {
                        value: 'vague',
                        text: `Wskazuje tylko ogólnie, jak np. „marketing” czy „statystyki”.`,
                    },
                    {
                        value: 'no',
                        text: `Nie. Nie wiadomo, na czym ten uzasadniony interes polega.`,
                    },
                ],
            },
            {
                type: 'text',
                title: `Jak administrator opisał to, na czym polega uzasadniony interes w kontekście ${host}?`,
                name: f('legitimate_interest_description'),
                visibleIf: `{${f('legitimate_interest_activity_specified')}} = 'vague'`,
                placeholder: 'marketing',
                defaultValueExpression:
                    index == 0
                        ? 'marketing'
                        : `{${f('legitimate_interest_description', previous_host)}}`,
            },
            {
                type: 'radiogroup',
                title: `Czy domena ${host} należy do podmiotu spoza Europy (np. Google, Facebook)?`,
                name: f('outside_eu'),
                ...defaultValue('outside_eu'),
                visibleIf: `{${f('legitimate_interest_activity_specified')}} = "precise" or {${f(
                    'consent_problems'
                )}} = "none"`,
                choices: [
                    { value: 'yes', text: 'Tak' },
                    { value: 'no', text: 'Nie' },
                    { value: 'not_sure', text: 'Nie wiem' },
                ],
            },
            {
                type: 'radiogroup',
                title: `Czy w {Twojej} ocenie wysłanie {Twoich} danych do właściciela domeny  ${host} było konieczne do świadczenia zażądanej przez {Ciebie} usługi drogą elektroniczną?`,
                name: f('was_processing_necessary'),
                ...defaultValue('was_processing_necessary'),
                visibleIf: `{${f('legal_basis_type')}} = "legitimate_interest" or {${f(
                    'present'
                )}} = "not_mentioned" or {popup_type} = "none"`,
                choices: [
                    { value: 'yes', text: 'Tak, było konieczne' },
                    { value: 'no', text: 'Nie, nie było konieczne' },
                    { value: 'not_sure', text: 'Nie mam zdania' },
                ],
            },
        ],
    };
}

export default function generateSurveyQuestions(hosts: string[]) {
    return {
        showQuestionNumbers: 'off',
        showProgressBar: 'top',
        clearInvisibleValues: 'onHidden',
        pages: [
            {
                title: 'Zaimki',
                elements: [
                    {
                        type: 'radiogroup',
                        name: 'zaimek',
                        title: 'Forma czasownika:',
                        isRequired: true,
                        choices: [
                            { value: 0, text: 'Wysłałem' },
                            { value: 1, text: 'Wysłałam' },
                            { value: 2, text: 'Wysłałom' },
                            { value: 3, text: 'Wysłaliśmy' },
                        ],
                    },
                ],
            },
            {
                title: 'Obowiązek informacyjny i mechanizm pozyskiwania zgody',
                elements: [
                    {
                        type: 'radiogroup',
                        title: 'Jaką formę informacji o przetwarzaniu danych osobowych stosuje ta strona?',
                        name: 'popup_type',
                        isRequired: true,
                        choices: [
                            { value: 'none', text: 'Brak informacji' },
                            {
                                value: 'page',
                                text: 'Tylko w postaci tekstu na podstronie np. "prywatność" lub "polityka cookies"',
                            },
                            {
                                value: 'passive_popup',
                                text: /* HTML */ `Okienko o cookiesach, bez możliwości podjęcia
                                żadnego wyboru (np. tylko opcja „zamknij”)`,
                            },
                            {
                                value: 'some_choice',
                                text: 'Okienko o cookiesach, z możliwością podjęcia wyboru',
                            },
                        ],
                    },
                    {
                        type: 'checkbox',
                        title: /* HTML */ `Istnieje możliwość, że okienko z informacjami i wyborami
                        dotyczącymi przetwarzania {Twoich} danych osobowych ukazało się dawno temu w
                        trakcie {twojej} wcześniejszej wizyty i wtedy je {odkliknąłeś}. {Otwórz} tę
                        samą stronę w Trybie Prywatnym (Incognito). Co {widzisz}?`,
                        visibleIf: "{popup_type} = 'none' or {popup_type} = 'page'",
                        name: 'is_incognito_different',
                        isRequired: true,
                        choices: [
                            {
                                value: 'incognito_is_the_same',
                                text: 'W Trybie prywatnym {widzę} to samo, co {widziałem} w normalnym trybie',
                            },
                        ],
                    },
                    {
                        type: 'html',
                        visibleIf:
                            '{is_incognito_different} != "no" and ({popup_type} = "none" or {popup_type} = "page") ',
                        html: /* HTML */ `Jeżeli w trybie incognito widzisz więcej okienek z
                            informacjami o przetwarzaniu danych osobowych, wykonaj analizę w
                            normalnym trybie ponownie - ale najpierw usuń pliki cookies tej strony.
                            <a
                                href="https://support.mozilla.org/pl/kb/usuwanie-ciasteczek-i-danych-stron-firefox?redirectslug=usuwanie-ciasteczek&redirectlocale=pl"
                                target="_blank"
                            >
                                Zobacz, jak to zrobić
                            </a>`,
                    },
                    {
                        type: 'radiogroup',
                        name: 'mentions_passive_consent',
                        isRequired: true,
                        visibleIf: '{popup_type} = "passive_popup"',
                        title: 'Czy treść okienka wskazuje na zgodę wyrażoną pasywnie, np. „Korzystając z naszej strony wyrażasz zgodę”,  „Brak zmiany ustawień przeglądarki oznacza zgodę”, „Klikając przycisk "X" (zamknij) wyrażasz zgodę”?',
                        choices: [
                            {
                                value: 'yes',
                                text: 'Tak',
                            },
                            {
                                value: 'no',
                                text: 'Nie',
                            },
                        ],
                    },
                    {
                        type: 'text',
                        name: 'passive_consent_description',
                        isRequired: true,
                        visibleIf: '{mentions_passive_consent} = "yes"',
                        title: 'Jakimi słowami administrator opisuje to pasywne wyrażenie zgody? Zacytuj wprost. Na przykład: „Korzystając ze strony wyrażasz zgodę”, albo „Pozostawiając ustawienia przeglądarki bez zmian (..) wyrażasz zgodę”',
                        defaultValue: 'Korzystając ze strony wyrażasz zgodę',
                    },
                    {
                        type: 'radiogroup',
                        name: 'cookie_wall',
                        isRequired: true,
                        visibleIf: '{popup_type} = "passive_popup"',
                        title: 'Czy treść strony jest wygodnie czytelna bez odkliknięcia tego okienka o RODO?',
                        choices: [
                            {
                                value: 'no', // wiem, że tu jest "no", a odpowiedź brzmi "tak" - ale nazwa pytania dotyczy obecności cookie walla
                                text: 'Tak, jest czytelna',
                            },
                            {
                                value: 'yes',
                                text: 'Nie. Jest zupełnie niewidoczna albo jest przesłonięta w stopniu uniemożliwiającym lub znacznie utrudniającym czytanie treści strony.',
                            },
                        ],
                    },
                    {
                        type: 'radiogroup',
                        name: 'rejection_is_hard',
                        isRequired: true,
                        visibleIf: '{popup_type} = "some_choice"',
                        title: 'Czy wyrażenie zgody na wszystkie cele jest dokładnie tak samo łatwe, jak odmowa zgody na wszystkie cele?',
                        choices: [
                            {
                                value: 'no', // wiem, że tu jest "no", a odpowiedź brzmi "tak" - ale nazwa pytania dotyczy braku równowagi
                                text: 'Tak. Opcja odmowy zgody na wszystkie cele jest równie widoczna i łatwo dostępna, co opcja wyrażenia zgody.',
                            },
                            {
                                value: 'yes',
                                text: 'Nie. Muszę wykonać więcej czynności aby odmówić wszystkich zgód, albo opcja niewyrażenia zgody jest mało widoczna.',
                            },
                        ],
                    },
                    {
                        type: 'radiogroup',
                        name: 'popup_action',
                        isRequired: true,
                        visibleIf: '{popup_type} = "some_choice" or {popup_type} = "passive_popup"',
                        title: 'Jaką akcję {podjąłeś} w ramach wyskakującego okienka?',
                        choices: [
                            {
                                value: 'none',
                                text: 'Nic nie {kliknąłem}',
                            },
                            {
                                value: 'closed_popup',
                                text: '{Zamknąłem} okienko za pomocą przycisku „X” lub „Zamknij”, lub podobnego',
                            },
                            {
                                value: 'accept_all',
                                text: '{Kliknąłem} przycisk od akceptacji wszystkich zgód',
                            },
                            {
                                value: 'deny_all',
                                text: '{Odmówiłem} wyrażenia zgody na wszystkie cele',
                            },
                            {
                                value: 'other',
                                text: 'Coś innego',
                            },
                        ],
                    },
                    {
                        type: 'text',
                        name: 'popup_closed_how',
                        isRequired: true,
                        visibleIf: '{popup_action} = "closed_popup"',
                        title: 'W jaki sposób {zamknąłeś} okienko o zgodę? Opisz pełnym zdaniem',
                        defaultValueExpression: '{Kliknąłem} przycisk „X”.',
                    },
                    {
                        type: 'text',
                        name: 'popup_deny_all_how',
                        isRequired: true,
                        visibleIf: '{popup_action} = "deny_all"',
                        title: 'W jaki sposób {zamknąłeś} okienko o zgodę? Opisz pełnym zdaniem, np.: „{Kliknąłem} przycisk <Odrzuć wszystkie>” lub „{Odznaczyłem} wszystkie opcje w ustawieniach zaawansowanych”',
                        defaultValueExpression: '{Kliknąłem} przycisk „odmawiam wyrażenia zgody”.',
                    },
                    {
                        type: 'radiogroup',
                        name: 'administrator_identity_available_before_choice',
                        isRequired: true,
                        visibleIf: '{popup_type} = "some_choice"',
                        title: 'Czy przed podjęciem wyboru dot. {Twoich} danych masz możliwość poznać tożsamość administratora strony?',
                        choices: [
                            {
                                value: 'yes',
                                text: 'Tak.',
                            },
                            {
                                value: 'no',
                                text: 'Nie.',
                            },
                        ],
                    },
                ],
            },
            {
                title: 'Obowiązek informacyjny, polityka prywatności',
                visibleIf: "{popup_type} != 'none'",
                elements: [
                    {
                        type: 'radiogroup',
                        title: 'Czy polityka prywatności jest dostępna i czytelna?',
                        name: 'policy_readable',
                        isRequired: true,
                        choices: [
                            { value: 'yes', text: 'dostępna i czytelna' },
                            {
                                value: 'entirely_obscured_by_popup',
                                text: 'dostępna, ale nieczytelna. Zasłania ją całkowicie lub prawie całkowicie popup o RODO lub nie można się do niej doklikać bez podjęcia wyboru w okienku',
                            },
                            {
                                value: 'cant_find',
                                text: `Niedostępna. {Szukałem}, ale nie {znalazłem} jej na stronie`,
                            },
                        ],
                    },
                ],
            },
            ...hosts.map(generateHostPage),
        ],
    };
}
