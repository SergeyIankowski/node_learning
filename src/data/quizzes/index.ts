import type { QuizLevel, QuizQuestion } from '../types';
import { quizzes01to04 } from './weeks-01-04';
import { quizzes05to08 } from './weeks-05-08';
import { quizzes09to12 } from './weeks-09-12';
import { quizzes13to16 } from './weeks-13-16';
import { quizzes17to20 } from './weeks-17-20';

/** Theory tests keyed by read-task id. */
export const quizzes: Record<string, QuizQuestion[]> = {
  ...quizzes01to04,
  ...quizzes05to08,
  ...quizzes09to12,
  ...quizzes13to16,
  ...quizzes17to20,
};

export const LEVELS: QuizLevel[] = ['basic', 'intermediate', 'advanced'];

export const LEVEL_LABEL: Record<QuizLevel, string> = {
  basic: 'Basic',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** Questions ordered from basic to advanced, so the test gets deeper as you go. */
export function getQuiz(taskId: string): QuizQuestion[] {
  const list = quizzes[taskId] ?? [];
  return LEVELS.flatMap((level) => list.filter((q) => q.level === level));
}
