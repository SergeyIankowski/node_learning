import { Link } from 'react-router-dom';
import { allTasks, taskPath } from '../../data';
import type { ProjectTask } from '../../data/types';
import { useProgress } from '../../store/progress';
import { Card, ExternalLink, Markdown } from '../ui';
import styles from './TaskViews.module.css';

export function ProjectTaskView({ task }: { task: ProjectTask }) {
  const completed = useProgress((s) => s.completed);
  const steps = allTasks.filter((r) => r.task.kind === 'code' && r.task.projectId === task.id);

  return (
    <>
      <Card title="Overview">
        <Markdown>{task.overview}</Markdown>
        <div className={styles.facts} style={{ marginTop: 12 }}>
          {task.starterRepo && <ExternalLink href={task.starterRepo}>Starter repository</ExternalLink>}
          <ExternalLink href={task.assignmentUrl}>Original assignment</ExternalLink>
          <ExternalLink href={task.scoreUrl}>Score calculation</ExternalLink>
          {task.maxScore !== undefined && <span className="muted">Max score: {task.maxScore}</span>}
        </div>
      </Card>
      <Card title="Technical requirements">
        <ul className={styles.checklist}>
          {task.requirements.map((r) => (
            <li key={r}>
              <Markdown>{r}</Markdown>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Specification">
        <Markdown>{task.spec}</Markdown>
      </Card>
      {steps.length > 0 && (
        <Card title={`Implementation steps (${steps.filter((s) => completed[s.task.id]).length}/${steps.length})`}>
          <ol>
            {steps.map((s) => (
              <li key={s.task.id}>
                <Link to={taskPath(s.week.id, s.task.id)}>{s.task.title}</Link>
                <span className="muted">
                  {' '}
                  · week {s.week.number}
                  {completed[s.task.id] ? ' · ✓ done' : ''}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      )}
      <Card title="Scoring">
        {task.scoring.map((group) => (
          <div key={group.scope}>
            <h3 className={styles.scopeTitle}>{group.scope}</h3>
            <ul className={[styles.checklist, group.scope === 'Forfeits' && styles.forfeit].filter(Boolean).join(' ')}>
              {group.items.map((item) => (
                <li key={item}>
                  <Markdown>{item}</Markdown>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Card>
      <Card title="Deliverables">
        <ul className={styles.checklist}>
          {task.deliverables.map((d) => (
            <li key={d}>
              <Markdown>{d}</Markdown>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
