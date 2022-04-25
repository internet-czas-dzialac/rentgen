import * as Survey from 'survey-react';
import RawAnswers from './raw-answers';
import useSurvey from './use-survey';

export default function Questions({
    hosts,
    onComplete,
}: {
    hosts: string[];
    onComplete: (data: RawAnswers) => void;
}) {
    const survey = useSurvey(hosts, {
        onComplete: (sender) => onComplete(sender.data),
    });
    if (!survey) {
        return <div>Wczytywanie...</div>;
    }
    return <Survey.Survey model={survey} />;
}
