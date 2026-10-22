import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ByLevel } from '../data/quizzes/grading';
import type { Week } from '../data/types';

export const STORAGE_KEY = 'node-learning-progress';

/** Share of correct answers needed to pass a theory test. */
export const QUIZ_PASS_RATIO = 0.8;

export type QuizResult = {
  /** Correct answers in the best attempt. */
  best: number;
  /** Correct answers in the latest attempt. */
  last: number;
  total: number;
  attempts: number;
  /** Per-level breakdown of the latest attempt. */
  lastByLevel: ByLevel;
  /** ISO date of the latest attempt. */
  at: string;
};

export type ProgressState = {
  /** taskId -> ISO date when it was marked solved */
  completed: Record<string, string>;
  /** taskId -> theory test results */
  quizResults: Record<string, QuizResult>;
  toggle: (taskId: string) => void;
  setDone: (taskId: string, done: boolean) => void;
  recordQuiz: (taskId: string, byLevel: ByLevel) => void;
  reset: () => void;
  /** Replaces progress with an exported object; returns false if the shape is wrong. */
  importJson: (data: unknown) => boolean;
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      quizResults: {},
      toggle: (taskId) => get().setDone(taskId, !get().completed[taskId]),
      setDone: (taskId, done) =>
        set((s) => {
          const completed = { ...s.completed };
          if (done) completed[taskId] = new Date().toISOString();
          else delete completed[taskId];
          return { completed };
        }),
      recordQuiz: (taskId, byLevel) =>
        set((s) => {
          const scores = Object.values(byLevel);
          const correct = scores.reduce((n, l) => n + l.correct, 0);
          const total = scores.reduce((n, l) => n + l.total, 0);
          const prev = s.quizResults[taskId];
          const result: QuizResult = {
            best: Math.max(prev?.best ?? 0, correct),
            last: correct,
            total,
            attempts: (prev?.attempts ?? 0) + 1,
            lastByLevel: byLevel,
            at: new Date().toISOString(),
          };
          return { quizResults: { ...s.quizResults, [taskId]: result } };
        }),
      reset: () => set({ completed: {}, quizResults: {} }),
      importJson: (data) => {
        const completed = parseCompleted(data);
        if (!completed) return false;
        set({ completed, quizResults: parseQuizResults(data) });
        return true;
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      partialize: (s) => ({ completed: s.completed, quizResults: s.quizResults }),
      // v1 stored only `completed`.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<ProgressState>;
        return {
          completed: state.completed ?? {},
          quizResults: version < 2 ? {} : (state.quizResults ?? {}),
        };
      },
    },
  ),
);

/** Exports are `{ completed, quizResults }`; the raw persisted value wraps the same in `{ state }`. */
function unwrap(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  return (obj.state && typeof obj.state === 'object' ? obj.state : obj) as Record<string, unknown>;
}

function parseCompleted(data: unknown): Record<string, string> | null {
  const completed = unwrap(data)?.completed;
  if (!completed || typeof completed !== 'object' || Array.isArray(completed)) return null;
  const result: Record<string, string> = {};
  for (const [id, value] of Object.entries(completed)) {
    if (typeof value === 'string') result[id] = value;
    else if (value === true) result[id] = new Date().toISOString();
  }
  return result;
}

/** Optional in imports; malformed entries are dropped. */
function parseQuizResults(data: unknown): Record<string, QuizResult> {
  const raw = unwrap(data)?.quizResults;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const result: Record<string, QuizResult> = {};
  for (const [id, value] of Object.entries(raw as Record<string, Partial<QuizResult>>)) {
    if (value && typeof value.best === 'number' && typeof value.total === 'number') {
      result[id] = {
        best: value.best,
        last: typeof value.last === 'number' ? value.last : value.best,
        total: value.total,
        attempts: typeof value.attempts === 'number' ? value.attempts : 1,
        lastByLevel: value.lastByLevel && typeof value.lastByLevel === 'object' ? value.lastByLevel : {},
        at: typeof value.at === 'string' ? value.at : new Date().toISOString(),
      };
    }
  }
  return result;
}

export const quizPassed = (r: QuizResult | undefined) => Boolean(r?.total && r.best / r.total >= QUIZ_PASS_RATIO);

export type Progress = { done: number; total: number; ratio: number };

export function countProgress(taskIds: string[], completed: Record<string, string>): Progress {
  const done = taskIds.filter((id) => completed[id]).length;
  const total = taskIds.length;
  return { done, total, ratio: total ? done / total : 0 };
}

export function weekProgress(week: Week, completed: Record<string, string>): Progress {
  return countProgress(
    week.tasks.map((t) => t.id),
    completed,
  );
}

export function overallProgress(weeks: Week[], completed: Record<string, string>): Progress {
  return countProgress(
    weeks.flatMap((w) => w.tasks.map((t) => t.id)),
    completed,
  );
}

export type WeekStatus = 'todo' | 'active' | 'done';

export function weekStatus(p: Progress): WeekStatus {
  if (p.total > 0 && p.done === p.total) return 'done';
  return p.done > 0 ? 'active' : 'todo';
}
