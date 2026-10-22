import { beforeEach, describe, expect, it } from 'vitest';
import { weeks } from '../data';
import { overallProgress, quizPassed, STORAGE_KEY, useProgress, weekProgress, weekStatus } from './progress';

describe('progress store', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgress.getState().reset();
  });

  it('toggles a task on and off', () => {
    const { toggle } = useProgress.getState();
    toggle('w01-fs-snapshot');
    expect(useProgress.getState().completed['w01-fs-snapshot']).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    toggle('w01-fs-snapshot');
    expect(useProgress.getState().completed['w01-fs-snapshot']).toBeUndefined();
  });

  it('persists only data (no actions) as a plain JSON object', () => {
    useProgress.getState().setDone('w01-fs-merge', true);
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(Object.keys(raw.state)).toEqual(['completed', 'quizResults']);
    expect(raw.version).toBe(2);
    expect(raw.state.completed['w01-fs-merge']).toBeTypeOf('string');
  });

  it('imports exported and raw persisted shapes, rejects garbage', () => {
    const { importJson } = useProgress.getState();
    expect(importJson({ completed: { a: '2026-01-01T00:00:00.000Z' } })).toBe(true);
    expect(useProgress.getState().completed).toEqual({ a: '2026-01-01T00:00:00.000Z' });
    expect(importJson({ state: { completed: { b: true } }, version: 1 })).toBe(true);
    expect(Object.keys(useProgress.getState().completed)).toEqual(['b']);
    expect(importJson('nope')).toBe(false);
    expect(importJson({ completed: [] })).toBe(false);
    expect(Object.keys(useProgress.getState().completed)).toEqual(['b']);
  });

  it('records test attempts keeping the best score', () => {
    const { recordQuiz } = useProgress.getState();
    recordQuiz('w01-install-read', { basic: { correct: 4, total: 4 }, advanced: { correct: 1, total: 3 } });
    recordQuiz('w01-install-read', { basic: { correct: 2, total: 4 }, advanced: { correct: 0, total: 3 } });
    const r = useProgress.getState().quizResults['w01-install-read'];
    expect(r).toMatchObject({
      best: 5,
      last: 2,
      total: 7,
      attempts: 2,
      lastByLevel: { basic: { correct: 2, total: 4 } },
    });
    expect(quizPassed(r)).toBe(false);
    recordQuiz('w01-install-read', { basic: { correct: 4, total: 4 }, advanced: { correct: 3, total: 3 } });
    expect(quizPassed(useProgress.getState().quizResults['w01-install-read'])).toBe(true);
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(raw.state.quizResults['w01-install-read'].best).toBe(7);
  });

  it('imports test results along with progress, and reset clears both', () => {
    const { importJson, reset } = useProgress.getState();
    expect(importJson({ completed: {}, quizResults: { x: { best: 9, total: 10 }, bad: 'nope' } })).toBe(true);
    expect(useProgress.getState().quizResults).toEqual({
      x: expect.objectContaining({ best: 9, last: 9, total: 10, attempts: 1 }),
    });
    reset();
    expect(useProgress.getState().quizResults).toEqual({});
  });

  it('migrates v1 saved progress (no test results)', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { completed: { a: '2026-01-01T00:00:00.000Z' } }, version: 1 }),
    );
    await useProgress.persist.rehydrate();
    expect(useProgress.getState().completed).toEqual({ a: '2026-01-01T00:00:00.000Z' });
    expect(useProgress.getState().quizResults).toEqual({});
  });

  it('derives week and overall progress', () => {
    const week = weeks[0];
    const { setDone } = useProgress.getState();
    expect(weekStatus(weekProgress(week, useProgress.getState().completed))).toBe('todo');
    setDone(week.tasks[0].id, true);
    expect(weekStatus(weekProgress(week, useProgress.getState().completed))).toBe('active');
    for (const t of week.tasks) setDone(t.id, true);
    const p = weekProgress(week, useProgress.getState().completed);
    expect(p).toEqual({ done: week.tasks.length, total: week.tasks.length, ratio: 1 });
    expect(weekStatus(p)).toBe('done');
    expect(overallProgress(weeks, useProgress.getState().completed).done).toBe(week.tasks.length);
  });
});
