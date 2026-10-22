import type { QuizLevel, QuizQuestion } from '../types';

export type LevelScore = { correct: number; total: number };
export type ByLevel = Partial<Record<QuizLevel, LevelScore>>;

/** A question counts as correct only if exactly the right set of options is selected. */
export function isCorrect(question: QuizQuestion, selected: number[]): boolean {
  if (selected.length !== question.answers.length) return false;
  return question.answers.every((a) => selected.includes(a));
}

export function gradeQuiz(
  questions: QuizQuestion[],
  selections: number[][],
): { byLevel: ByLevel; correct: number; total: number } {
  const byLevel: ByLevel = {};
  questions.forEach((q, i) => {
    const level = byLevel[q.level] ?? { correct: 0, total: 0 };
    byLevel[q.level] = level;
    level.total += 1;
    if (isCorrect(q, selections[i] ?? [])) level.correct += 1;
  });
  const scores = Object.values(byLevel);
  return {
    byLevel,
    correct: scores.reduce((n, s) => n + s.correct, 0),
    total: scores.reduce((n, s) => n + s.total, 0),
  };
}

export type Depth = { label: string; text: string; tone: 'deep' | 'solid' | 'working' | 'review' };

const ratio = (s: LevelScore | undefined) => (s?.total ? s.correct / s.total : 0);

/** Turns a per-level score into a verdict on how deep the understanding goes. */
export function depthVerdict(byLevel: ByLevel): Depth {
  const scores = Object.values(byLevel);
  const total = scores.reduce((n, s) => n + s.total, 0);
  const overall = total ? scores.reduce((n, s) => n + s.correct, 0) / total : 0;
  const advanced = ratio(byLevel.advanced);
  const basics = ratio(byLevel.basic);

  if (overall >= 0.8 && advanced >= 0.67) {
    return {
      tone: 'deep',
      label: 'Deep understanding',
      text: 'You handle the edge cases and trade-offs, not just the definitions. You are ready to apply this in the project.',
    };
  }
  if (overall >= 0.8) {
    return {
      tone: 'solid',
      label: 'Solid understanding',
      text: 'The core concepts are solid. Read the explanations for the advanced questions you missed: that is where the remaining depth is.',
    };
  }
  if (basics >= 0.75 && overall >= 0.5) {
    return {
      tone: 'working',
      label: 'Working knowledge',
      text: 'You know the basics, but applying them is still shaky. Revisit the resources for the topics you missed, then retake the test.',
    };
  }
  return {
    tone: 'review',
    label: 'Needs review',
    text: 'The fundamentals are not there yet. Go through the resources again before moving on to the practice tasks.',
  };
}

/** Random display order of option indexes (Fisher–Yates), so the right answer's position carries no signal. */
export function shuffledOrder(n: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
