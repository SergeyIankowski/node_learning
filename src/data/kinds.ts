import type { TaskKind } from './types';

export const KIND_META: Record<
  TaskKind,
  { label: string; plural: string; color: string; cssVar: string; icon: string }
> = {
  read: { label: 'Read', plural: 'Theory', color: '#5b9bd5', cssVar: 'var(--kind-read)', icon: '◯' },
  code: { label: 'Code', plural: 'Practice', color: '#e0a84a', cssVar: 'var(--kind-code)', icon: '▢' },
  project: { label: 'Project', plural: 'Project', color: '#b07ce8', cssVar: 'var(--kind-project)', icon: '◇' },
};

export const KIND_ORDER: TaskKind[] = ['read', 'code', 'project'];
