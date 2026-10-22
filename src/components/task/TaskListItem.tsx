import { Link } from 'react-router-dom';
import { taskPath } from '../../data';
import { KIND_META } from '../../data/kinds';
import type { Task } from '../../data/types';
import { quizPassed, useProgress } from '../../store/progress';
import { Badge, Checkbox } from '../ui';
import styles from './TaskListItem.module.css';

export function TaskListItem({ task, weekId }: { task: Task; weekId: string }) {
  const done = useProgress((s) => Boolean(s.completed[task.id]));
  const setDone = useProgress((s) => s.setDone);
  const quiz = useProgress((s) => s.quizResults[task.id]);
  const meta = KIND_META[task.kind];
  const warmup = task.kind === 'code' && task.warmup;

  return (
    <div className={[styles.item, done && styles.done].filter(Boolean).join(' ')}>
      <Checkbox checked={done} onChange={(v) => setDone(task.id, v)} ariaLabel={`Mark "${task.title}" as solved`} />
      <div className={styles.body}>
        <Link to={taskPath(weekId, task.id)} className={styles.title}>
          {task.title}
        </Link>
        <div className={styles.summary}>{task.summary}</div>
      </div>
      <div className={styles.meta}>
        {warmup && <Badge>warm-up</Badge>}
        {task.kind === 'read' &&
          (quiz ? (
            <Badge color={quizPassed(quiz) ? 'var(--done)' : 'var(--active)'} title="Best test score">
              test {quiz.best}/{quiz.total}
            </Badge>
          ) : (
            <Badge title="Theory test not taken yet">test –</Badge>
          ))}
        <Badge color={meta.cssVar}>
          {meta.icon} {meta.label}
        </Badge>
        <span className={styles.est}>~{task.estimateH}h</span>
      </div>
    </div>
  );
}
