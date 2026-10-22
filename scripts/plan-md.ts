/**
 * Generates STUDY_PLAN.md from the app data so the written plan never drifts from the app.
 * Run with `npm run plan:md`.
 */
import { writeFileSync } from 'node:fs';
import { weeks } from '../src/data';
import { KIND_META } from '../src/data/kinds';
import { getQuiz } from '../src/data/quizzes';

const lines: string[] = [
  '# Node.js study plan (RS School program, 20 weeks)',
  '',
  '> Generated from `src/data` by `npm run plan:md`. Do not edit by hand.',
  '',
  'Source program: https://github.com/rolling-scopes-school/tasks/blob/master/node/README.md',
  '',
  'Each program week is split into two study weeks. Task kinds: **Read** (theory, each with a multi-level test), **Code** (exercise or assignment step), **Project** (full app specification).',
  '',
  '## Overview',
  '',
  '| Week | Program week | Topic | Read | Code | Project | Hours |',
  '|---|---|---|---|---|---|---|',
];

for (const w of weeks) {
  const count = (kind: string) => w.tasks.filter((t) => t.kind === kind).length;
  const hours = w.tasks.reduce((h, t) => h + t.estimateH, 0);
  lines.push(
    `| ${w.number} | ${w.programWeek} | ${w.title} | ${count('read')} | ${count('code')} | ${count('project')} | ~${Math.round(hours)} |`,
  );
}

for (const w of weeks) {
  lines.push(
    '',
    `## Week ${w.number}: ${w.title}`,
    '',
    `Program week ${w.programWeek} · ${w.modules.map((m) => `[${m.title}](${m.url})`).join(' · ')}`,
    '',
  );
  lines.push('**Goals**', '', ...w.goals.map((g) => `- ${g}`), '', '**Tasks**', '');
  for (const t of w.tasks) {
    const warm = t.kind === 'code' && t.warmup ? ' _(warm-up)_' : '';
    const test = t.kind === 'read' ? ` Ends with a ${getQuiz(t.id).length}-question test.` : '';
    lines.push(`- [ ] **${KIND_META[t.kind].label}**: ${t.title}${warm} (~${t.estimateH}h): ${t.summary}${test}`);
  }
}

writeFileSync(new URL('../STUDY_PLAN.md', import.meta.url), `${lines.join('\n')}\n`);
console.log(`STUDY_PLAN.md written: ${weeks.length} weeks, ${weeks.reduce((n, w) => n + w.tasks.length, 0)} tasks`);
