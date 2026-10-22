import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../types';
import { depthVerdict, gradeQuiz, isCorrect, shuffledOrder } from './grading';
import { adv, basic, mid } from './q';

describe('q helpers', () => {
  it('turns starred options into answers', () => {
    expect(basic('Q', ['a', '*b', 'c'], 'e')).toEqual({
      level: 'basic',
      question: 'Q',
      options: ['a', 'b', 'c'],
      answers: [1],
      explanation: 'e',
    });
    expect(mid('Q', ['*a', 'b', '*c'], 'e').answers).toEqual([0, 2]);
    expect(() => adv('Q', ['a', 'b'], 'e')).toThrow(/no correct option/);
  });
});

describe('isCorrect', () => {
  const multi = mid('Q', ['*a', '*b', 'c'], 'e');
  it('requires exactly the right set', () => {
    expect(isCorrect(multi, [1, 0])).toBe(true);
    expect(isCorrect(multi, [0])).toBe(false);
    expect(isCorrect(multi, [0, 1, 2])).toBe(false);
    expect(isCorrect(basic('Q', ['a', '*b'], 'e'), [])).toBe(false);
  });
});

describe('gradeQuiz and depthVerdict', () => {
  const quiz: QuizQuestion[] = [
    basic('1', ['*a', 'b'], 'e'),
    basic('2', ['*a', 'b'], 'e'),
    mid('3', ['*a', 'b'], 'e'),
    mid('4', ['*a', 'b'], 'e'),
    adv('5', ['*a', 'b'], 'e'),
    adv('6', ['*a', 'b'], 'e'),
  ];
  const answer = (rightIdx: number[]) => quiz.map((_, i) => (rightIdx.includes(i) ? [0] : [1]));

  it('scores by level', () => {
    const g = gradeQuiz(quiz, answer([0, 1, 2, 4]));
    expect(g).toEqual({
      correct: 4,
      total: 6,
      byLevel: {
        basic: { correct: 2, total: 2 },
        intermediate: { correct: 1, total: 2 },
        advanced: { correct: 1, total: 2 },
      },
    });
  });

  it('gives a deeper verdict only when advanced questions are right too', () => {
    expect(depthVerdict(gradeQuiz(quiz, answer([0, 1, 2, 3, 4, 5])).byLevel).tone).toBe('deep');
    expect(
      depthVerdict({
        basic: { correct: 4, total: 4 },
        intermediate: { correct: 4, total: 4 },
        advanced: { correct: 1, total: 3 },
      }).tone,
    ).toBe('solid');
    expect(depthVerdict(gradeQuiz(quiz, answer([0, 1, 2])).byLevel).tone).toBe('working');
    expect(depthVerdict(gradeQuiz(quiz, answer([4])).byLevel).tone).toBe('review');
  });
});

describe('shuffledOrder', () => {
  it('returns a permutation of option indexes', () => {
    for (let i = 0; i < 50; i++) expect([...shuffledOrder(4)].sort()).toEqual([0, 1, 2, 3]);
  });

  it('puts the first option in every position over many shuffles', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) seen.add(shuffledOrder(4).indexOf(0));
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
  });
});
