import type { Task, Week } from './types';
import { week01 } from './weeks/week-01';
import { week02 } from './weeks/week-02';
import { week03 } from './weeks/week-03';
import { week04 } from './weeks/week-04';
import { week05 } from './weeks/week-05';
import { week06 } from './weeks/week-06';
import { week07 } from './weeks/week-07';
import { week08 } from './weeks/week-08';
import { week09 } from './weeks/week-09';
import { week10 } from './weeks/week-10';
import { week11 } from './weeks/week-11';
import { week12 } from './weeks/week-12';
import { week13 } from './weeks/week-13';
import { week14 } from './weeks/week-14';
import { week15 } from './weeks/week-15';
import { week16 } from './weeks/week-16';
import { week17 } from './weeks/week-17';
import { week18 } from './weeks/week-18';
import { week19 } from './weeks/week-19';
import { week20 } from './weeks/week-20';

export const weeks: Week[] = [
  week01,
  week02,
  week03,
  week04,
  week05,
  week06,
  week07,
  week08,
  week09,
  week10,
  week11,
  week12,
  week13,
  week14,
  week15,
  week16,
  week17,
  week18,
  week19,
  week20,
];

export type TaskRef = { week: Week; task: Task; index: number };

/** All tasks in study order. */
export const allTasks: TaskRef[] = weeks.flatMap((week) => week.tasks.map((task, index) => ({ week, task, index })));

const taskById = new Map(allTasks.map((ref) => [ref.task.id, ref]));
const weekById = new Map(weeks.map((w) => [w.id, w]));

export const getWeek = (id: string | undefined) => (id ? weekById.get(id) : undefined);
export const getTaskRef = (id: string | undefined) => (id ? taskById.get(id) : undefined);

export function neighbours<T>(list: T[], item: T): { prev?: T; next?: T } {
  const i = list.indexOf(item);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 ? list[i + 1] : undefined };
}

export const taskPath = (weekId: string, taskId: string) => `/week/${weekId}/task/${taskId}`;
export const weekPath = (weekId: string) => `/week/${weekId}`;
