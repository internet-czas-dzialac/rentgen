import { getDate } from '../../util';

declare var PLUGIN_NAME: string;
declare var PLUGIN_URL: string;

export default function emailIntro(
    tone: 'polite' | 'official',
    _: (verb: string) => string,
    visited_url: string
) {
    return (
        <>
            <p>{tone == 'polite' ? 'Szanowni Państwo' : 'Dzień dobry'},</p>
            <p>
                w dniu {getDate()} {_('odwiedziłem')} stronę {visited_url}. Po podejrzeniu ruchu
                sieciowego generowanego przez tę stronę za pomocą wtyczki{' '}
                <a href={PLUGIN_URL}>{PLUGIN_NAME}</a> w przeglądarce Firefox{' '}
                {tone == 'polite' ? (
                    <>
                        {_('chciałbym')} zwrócić Państwa uwagę na kilka potencjalnych problemów ze
                        zgodnością RODO na Państwa stronie.
                    </>
                ) : (
                    <>
                        {_('mam')} pytania dotyczące przetwarzania {_('moich')} danych osobowych, na
                        które nie {_('znalazłem')} odpowiedzi nigdzie na Państwa stronie.
                    </>
                )}
            </p>
        </>
    );
}
