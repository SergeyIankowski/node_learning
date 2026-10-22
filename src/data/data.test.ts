import { describe, expect, it } from 'vitest';
import { allTasks, getTaskRef, weeks } from './index';

describe('study plan data', () => {
  it('has 20 weeks, two per program week, numbered in order', () => {
    expect(weeks).toHaveLength(20);
    weeks.forEach((w, i) => {
      expect(w.number).toBe(i + 1);
      expect(w.id).toBe(`w${String(i + 1).padStart(2, '0')}`);
      expect(w.programWeek).toBe(Math.floor(i / 2) + 1);
    });
  });

  it('uses unique task ids prefixed with their week id', () => {
    const ids = allTasks.map((r) => r.task.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { week, task } of allTasks) expect(task.id.startsWith(`${week.id}-`)).toBe(true);
  });

  it('gives every week at least one task to solve', () => {
    for (const week of weeks)
      expect(
        week.tasks.some((t) => t.kind === 'code'),
        week.id,
      ).toBe(true);
  });

  it('links every code step to an existing project task', () => {
    for (const { task } of allTasks) {
      if (task.kind !== 'code' || !task.projectId) continue;
      expect(getTaskRef(task.projectId)?.task.kind, task.id).toBe('project');
    }
  });

  it('gives every project at least one implementation step', () => {
    const projects = allTasks.filter((r) => r.task.kind === 'project');
    expect(projects.length).toBeGreaterThanOrEqual(13);
    for (const p of projects) {
      const steps = allTasks.filter((r) => r.task.kind === 'code' && r.task.projectId === p.task.id);
      expect(steps.length, p.task.id).toBeGreaterThan(0);
    }
  });

  it('uses https links only', () => {
    const urls = weeks.flatMap((w) => [
      ...w.modules.map((m) => m.url),
      ...w.tasks.flatMap((t) =>
        t.kind === 'read'
          ? t.resources.map((r) => r.url)
          : t.kind === 'project'
            ? [t.assignmentUrl, t.scoreUrl, t.starterRepo ?? 'https://x']
            : [],
      ),
    ]);
    for (const url of urls) expect(url, url).toMatch(/^https:\/\/[^\s]+$/);
  });

  it('has non-empty content for every task', () => {
    for (const { task } of allTasks) {
      expect(task.title.trim(), task.id).not.toBe('');
      expect(task.summary.trim(), task.id).not.toBe('');
      expect(task.estimateH, task.id).toBeGreaterThan(0);
      if (task.kind === 'read') expect(task.resources.length, task.id).toBeGreaterThan(0);
      if (task.kind === 'code') expect(task.acceptance.length, task.id).toBeGreaterThan(0);
    }
  });
});
