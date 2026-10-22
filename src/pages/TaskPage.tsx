import { useParams } from 'react-router-dom';
import { CodeTaskView } from '../components/task/CodeTaskView';
import { ProjectTaskView } from '../components/task/ProjectTaskView';
import { ReadTaskView } from '../components/task/ReadTaskView';
import { Badge, Breadcrumbs, Checkbox, LinkButton } from '../components/ui';
import { allTasks, getTaskRef, neighbours, taskPath, weekPath } from '../data';
import { KIND_META } from '../data/kinds';
import type { Task } from '../data/types';
import { useProgress } from '../store/progress';
import { NotFound } from './NotFound';
import styles from './TaskPage.module.css';

const SOLVE_LABEL: Record<Task['kind'], string> = {
  read: 'Mark as read',
  code: 'Mark as solved',
  project: 'Mark project as shipped',
};

export function TaskPage() {
  const { weekId, taskId } = useParams();
  const ref = getTaskRef(taskId);
  const doneAt = useProgress((s) => (taskId ? s.completed[taskId] : undefined));
  const setDone = useProgress((s) => s.setDone);
  if (!ref || ref.week.id !== weekId) return <NotFound />;

  const { week, task } = ref;
  const meta = KIND_META[task.kind];
  const { prev, next } = neighbours(allTasks, ref);

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: 'Roadmap', to: '/' },
          { label: `Week ${week.number}: ${week.title}`, to: weekPath(week.id) },
          { label: task.title },
        ]}
      />
      <div className={styles.head}>
        <div className={styles.badges}>
          <Badge color={meta.cssVar}>
            {meta.icon} {meta.label}
          </Badge>
          {task.kind === 'code' && task.warmup && <Badge>warm-up</Badge>}
          <Badge>~{task.estimateH}h</Badge>
        </div>
        <h1 className={styles.title}>{task.title}</h1>
        <p className={styles.summary}>{task.summary}</p>
      </div>

      <SolveBar label={SOLVE_LABEL[task.kind]} doneAt={doneAt} onChange={(v) => setDone(task.id, v)} />

      {task.kind === 'read' && <ReadTaskView task={task} />}
      {task.kind === 'code' && <CodeTaskView task={task} />}
      {task.kind === 'project' && <ProjectTaskView task={task} />}

      <SolveBar label={SOLVE_LABEL[task.kind]} doneAt={doneAt} onChange={(v) => setDone(task.id, v)} />

      <div className={styles.nav}>
        <LinkButton to={prev ? taskPath(prev.week.id, prev.task.id) : '/'} disabled={!prev} title={prev?.task.title}>
          ← {prev ? prev.task.title : 'Previous'}
        </LinkButton>
        <LinkButton
          to={next ? taskPath(next.week.id, next.task.id) : '/'}
          disabled={!next}
          variant="primary"
          title={next?.task.title}
        >
          {next ? next.task.title : 'Next'} →
        </LinkButton>
      </div>
    </div>
  );
}

function SolveBar({ label, doneAt, onChange }: { label: string; doneAt?: string; onChange: (v: boolean) => void }) {
  return (
    <div className={[styles.solve, doneAt && styles.solved].filter(Boolean).join(' ')}>
      <Checkbox size="lg" checked={Boolean(doneAt)} onChange={onChange} label={label} />
      {doneAt && <span className={styles.date}>Done on {new Date(doneAt).toLocaleDateString()}</span>}
    </div>
  );
}
