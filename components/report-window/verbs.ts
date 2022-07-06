const words = {
    ciebie: ['ciebie', 'ciebie', 'ciebie', 'was'],
    dokonałeś: ['dokonałeś', 'dokonałaś', 'dokonałoś', 'dokonaliście'],
    jesteś: ['jesteś', 'jesteś', 'jesteś', 'jesteście'],
    kliknąłem: ['kliknąłem', 'kliknęłam', 'klinkęłom', 'kliknęliśmy'],
    mam: ['mam', 'mam', 'mam', 'mamy'],
    masz: ['masz', 'masz', 'masz', 'macie'],
    mnie: ['mnie', 'mnie', 'mnie', 'nas'],
    moich: ['moich', 'moich', 'moich', 'naszych'],
    moje: ['moje', 'moje', 'moje', 'nasze'],
    mojej: ['mojej', 'mojej', 'mojej', 'naszej'],
    muszę: ['muszę', 'muszę', 'muszę', 'musimy'],
    odkliknąłeś: ['odkliknąłeś', 'odkliknęłaś', 'odklikęłoś', 'odkliknęliście'],
    odmówiłem: ['odmówiłem', 'odmówiłam', 'odmówiłom', 'odmówiliśmy'],
    odmówiłeś: ['odmówiłeś', 'odmówiłaś', 'odmówiłoś', 'odmówiliście'],
    odwiedzałeś: ['odwiedzałeś', 'odwiedzałaś', 'odwiedzałoś', 'odwiedzaliście'],
    odwiedziłem: ['odwiedziłem', 'odwiedziłam', 'odwiedziłom', 'odwiedziliśmy'],
    odznaczyłem: ['odznaczyłem', 'odznaczyłam', 'odznaczyłom', 'odznaczyliśmy'],
    otwórz: ['otwórz', 'otwórz', 'otwórz', 'otwórzcie'],
    podjąłem: ['podjąłem', 'podjęłam', 'podjęłom', 'podjęliśmy'],
    podjąłeś: ['podjąłeś', 'podjęłaś', 'podjęłoś', 'podjęliście'],
    proszę: ['proszę', 'proszę', 'proszę', 'prosimy'],
    szukałem: ['szukałem', 'szukałam', 'szukałom', 'szukaliśmy'],
    tobie: ['tobie', 'tobie', 'tobie', 'wam'],
    twoich: ['twoich', 'twoich', 'twoich', 'waszych'],
    twojej: ['twojej', 'twojej', 'twojej', 'waszej'],
    usuń: ['usuń', 'usuń', 'usuń', 'usuńcie'],
    widzę: ['widzę', 'widzę', 'widzę', 'widzimy'],
    widziałem: ['widziałem', 'widziałam', 'widziałom', 'widzieliśmy'],
    widzisz: ['widzisz', 'widzisz', 'widzisz', 'widzicie'],
    wykonaj: ['wykonaj', 'wykonaj', 'wykonaj', 'wykonajcie'],
    wyraziłem: ['wyraziłem', 'wyraziłam', 'wyraziłom', 'wyraziliśmy'],
    wyraziłeś: ['wyraziłeś', 'wyraziłaś', 'wyraziłoś', 'wyraziliście'],
    zamknąłem: ['zamknąłem', 'zamknęłam', 'zamknęłom', 'zamknęliśmy'],
    zobacz: ['zobacz', 'zobacz', 'zobacz', 'zobaczcie'],
    zamknąłeś: ['zamknąłeś', 'zamknęłaś', 'zamknęłoś', 'zamknęliście'],
    znalazłem: ['znalazłem', 'znalazłam', 'znalazłom', 'znaleźliśmy'],
    zrobiłem: ['zrobiłem', 'zrobiłam', 'zrobiłom', 'zrobiliśmy'],
    zwracam: ['zwracam', 'zwracam', 'zwracam', 'zwracamy'],
} as { [key: string]: string[] };

export default words;

export function v(key: string, index: number) {
    let result = words[key.toLowerCase()]?.[index] || key;
    if (key[0] == key[0].toUpperCase()) {
        result = [result[0].toUpperCase(), ...result.slice(1)].join('');
    }
    return result;
}
