import * as React from 'react';
import * as Survey from 'survey-react';
import generateSurveyQuestions from './generate-survey-questions';
import RawAnswers from './raw-answers';
import verbs from './verbs';

export default function useSurvey(
    hosts: string[],
    { onComplete }: { onComplete: (sender: { data: RawAnswers }) => void }
): Survey.ReactSurveyModel {
    const [survey, setSurvey] = React.useState<Survey.Model>(null);
    React.useEffect(() => {
        const model = generateSurveyQuestions(hosts);
        const survey = new Survey.Model(model);
        survey.onProcessTextValue.add(function (
            sender: Survey.SurveyModel,
            options: { name: string; value?: string }
        ) {
            if (verbs[options.name.toLowerCase()]) {
                options.value = verbs[options.name.toLowerCase()][sender.valuesHash.zaimek];
                if (options.name[0] == options.name[0].toUpperCase()) {
                    options.value = [
                        options.value[0].toUpperCase(),
                        ...options.value.slice(1),
                    ].join('');
                }
            }
        });
        survey.onComplete.add(onComplete);
        setSurvey(survey);
    }, []);

    return survey;
}
