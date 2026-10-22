import { describe, expect, it } from 'vitest';
import { allTasks } from '../index';
import { getQuiz, LEVELS, quizzes } from './index';

const readTasks = allTasks.filter((r) => r.task.kind === 'read').map((r) => r.task.id);
const allQuestions = Object.values(quizzes).flat();

describe('theory tests', () => {
  it('exist for every theory task, and only for theory tasks', () => {
    expect(Object.keys(quizzes).sort()).toEqual([...readTasks].sort());
  });

  it('have at least 10 questions covering every depth level', () => {
    for (const id of readTasks) {
      const quiz = getQuiz(id);
      expect(quiz.length, id).toBeGreaterThanOrEqual(10);
      for (const level of LEVELS) {
        expect(quiz.filter((q) => q.level === level).length, `${id} ${level}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('have well-formed questions', () => {
    for (const q of allQuestions) {
      expect(q.question.trim(), q.question).not.toBe('');
      expect(q.explanation.trim(), q.question).not.toBe('');
      expect(q.options.length, q.question).toBeGreaterThanOrEqual(3);
      expect(new Set(q.options).size, q.question).toBe(q.options.length);
      expect(q.answers.length, q.question).toBeGreaterThan(0);
      expect(q.answers.length, q.question).toBeLessThan(q.options.length);
      for (const a of q.answers) expect(a, q.question).toBeLessThan(q.options.length);
      for (const o of q.options) expect(o.startsWith('*'), q.question).toBe(false);
    }
  });

  it('include "select all that apply" questions', () => {
    expect(allQuestions.filter((q) => q.answers.length > 1).length).toBeGreaterThanOrEqual(20);
  });

  it('are ordered from basic to advanced', () => {
    const order = getQuiz(readTasks[0]).map((q) => LEVELS.indexOf(q.level));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});
