import * as Survey from 'survey-react';
import { RequestCluster } from '../../request-cluster';
import RawAnswers from './raw-answers';
import useSurvey from './use-survey';

export default function Questions({
    clusters,
    onComplete,
}: {
    clusters: RequestCluster[];
    onComplete: (data: RawAnswers) => void;
}) {
    const survey = useSurvey(clusters, {
        onComplete: (sender) => onComplete(sender.data),
    });
    if (!survey) {
        return <div>Wczytywanie...</div>;
    }
    return <Survey.Survey model={survey} />;
}
