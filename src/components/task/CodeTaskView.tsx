import { Link } from 'react-router-dom';
import { getTaskRef, taskPath } from '../../data';
import type { CodeTask } from '../../data/types';
import { Card, CodeBlock, Collapsible, Markdown } from '../ui';
import styles from './TaskViews.module.css';

export function CodeTaskView({ task }: { task: CodeTask }) {
  const project = getTaskRef(task.projectId);
  return (
    <>
      {project && (
        <Card title="Part of project">
          <Link to={taskPath(project.week.id, project.task.id)}>◇ {project.task.title}</Link>
          {task.points !== undefined && <span className="muted"> · worth {task.points} points</span>}
        </Card>
      )}
      <Card title="Task">
        <Markdown>{task.description}</Markdown>
      </Card>
      {task.run && (
        <Card title="Run">
          <CodeBlock code={task.run} />
        </Card>
      )}
      {task.expected && (
        <Card title="Expected output">
          <CodeBlock code={task.expected} copyable={false} />
        </Card>
      )}
      <Card title="Done when">
        <ul className={styles.checklist}>
          {task.acceptance.map((a) => (
            <li key={a}>
              <Markdown>{a}</Markdown>
            </li>
          ))}
        </ul>
      </Card>
      {task.hints && task.hints.length > 0 && (
        <Card title="Hints">
          {task.hints.map((h, i) => (
            <Collapsible key={h} title={`Hint ${i + 1}`}>
              <Markdown>{h}</Markdown>
            </Collapsible>
          ))}
        </Card>
      )}
    </>
  );
}
