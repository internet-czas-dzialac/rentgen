import * as React from 'react';
import * as Survey from 'survey-react';
import generateSurveyQuestions from './generate-survey-questions';
import RawAnswers from './raw-answers';
import verbs, { v } from './verbs';

export default function useSurvey(
    hosts: string[],
    { onComplete }: { onComplete: (sender: { data: RawAnswers }) => void }
): Survey.ReactSurveyModel {
    const [survey, setSurvey] = React.useState<Survey.Model>(null);
    React.useEffect(() => {
        const model = generateSurveyQuestions(hosts);
        console.log(model);
        const survey = new Survey.Model(model);
        survey.onProcessTextValue.add(function (
            sender: Survey.SurveyModel,
            options: { name: string; value?: string }
        ) {
            if (verbs[options.name.toLowerCase()]) {
                options.value = v(options.name, sender.valuesHash.zaimek);
            }
        });
        survey.onComplete.add(onComplete);
        setSurvey(survey);
    }, []);

    return survey;
}