import type { QuizLevel, QuizQuestion } from '../types';

/**
 * Builds a question. Correct options are marked with a leading `*`, which is stripped.
 * More than one marked option makes it a "select all that apply" question.
 */
function make(level: QuizLevel) {
  return (question: string, options: string[], explanation: string): QuizQuestion => {
    const answers = options.flatMap((o, i) => (o.startsWith('*') ? [i] : []));
    if (answers.length === 0) throw new Error(`Quiz question has no correct option: ${question}`);
    return { level, question, options: options.map((o) => o.replace(/^\*/, '')), answers, explanation };
  };
}

export const basic = make('basic');
export const mid = make('intermediate');
export const adv = make('advanced');
