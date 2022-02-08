const words = {
    zrobiłem: ['zrobiłem', 'zrobiłam', 'zrobiłom', 'zrobiliśmy'],
    szukałem: ['szukałem', 'szukałam', 'szukałom', 'szukaliśmy'],
    znalazłem: ['znalazłem', 'znalazłam', 'znalazłom', 'znaleźliśmy'],
    moje: ['moje', 'moje', 'moje', 'nasze'],
    wyraziłem: ['wyraziłem', 'wyraziłam', 'wyraziłom', 'wyraziliśmy'],
    kliknąłem: ['kliknąłem', 'kliknęłam', 'klinkęłom', 'kliknęliśmy'],
    odwiedzałeś: ['odwiedzałeś', 'odwiedzałaś', 'odwiedzałoś', 'odwiedzaliście'],
    wyraziłeś: ['wyraziłeś', 'wyraziłaś', 'wyraziłoś', 'wyraziliście'],
    jesteś: ['jesteś', 'jesteś', 'jesteś', 'jesteście'],
    twoich: ['twoich', 'twoich', 'twoich', 'waszych'],
    tobie: ['tobie', 'tobie', 'tobie', 'wam'],
    twojej: ['twojej', 'twojej', 'twojej', 'waszej'],
    odkliknąłeś: ['odkliknąłeś', 'odkliknęłaś', 'odklikęłoś', 'odkliknęliście'],
    otwórz: ['otwórz', 'otwórz', 'otwórz', 'otwórzcie'],
    widzisz: ['widzisz', 'widzisz', 'widzisz', 'widzicie'],
    widzę: ['widzę', 'widzę', 'widzę', 'widzimy'],
    widziałem: ['widziałem', 'widziałam', 'widziałom', 'widzieliśmy'],
    odwiedziłem: ['odwiedziłem', 'odwiedziłam', 'odwiedziłom', 'odwiedziliśmy'],
    mam: ['mam', 'mam', 'mam', 'mamy'],
    podjąłeś: ['podjąłeś', 'podjęłaś', 'podjęłoś', 'podjęliście'],
    zamknąłem: ['zamknąłem', 'zamknęłaś', 'zamknęłoś', 'zamknęliście'],
    zwracam: ['zwracam', 'zwracam', 'zwracam', 'zwracamy'],
    moich: ['moich', 'moich', 'moich', 'naszych'],
    ciebie: ['ciebie', 'ciebie', 'ciebie', 'was'],
} as { [key: string]: string[] };

export default words;

export function v(key: string, index: number) {
    let result = words[key.toLowerCase()]?.[index] || key;
    if (key[0] == key[0].toUpperCase()) {
        result = [result[0].toUpperCase(), ...result.slice(1)].join('');
    }
    return result;
}
