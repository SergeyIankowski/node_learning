import { getQuiz } from '../../data/quizzes';
import type { ReadTask } from '../../data/types';
import { Card, ExternalLink } from '../ui';
import { Quiz } from './Quiz';
import styles from './TaskViews.module.css';

export function ReadTaskView({ task }: { task: ReadTask }) {
  const quiz = getQuiz(task.id);
  return (
    <>
      <Card title="Resources">
        <ul className={styles.resources}>
          {task.resources.map((r) => (
            <li key={r.url}>
              <ExternalLink href={r.url} lang={r.lang}>
                {r.title}
              </ExternalLink>
            </li>
          ))}
        </ul>
      </Card>
      {task.questions.length > 0 && (
        <Card title="Self-check: explain in your own words">
          <ol>
            {task.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </Card>
      )}
      {quiz.length > 0 && <Quiz key={task.id} taskId={task.id} questions={quiz} />}
    </>
  );
}
