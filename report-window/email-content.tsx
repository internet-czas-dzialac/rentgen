import { ParsedAnswers } from './parse-answers';

export default function EmailContent({ answers }: { answers: ParsedAnswers }) {
    return (
        <div>
            <h1>Email template</h1>
            <pre>{JSON.stringify(answers, null, 3)}</pre>
        </div>
    );
}
