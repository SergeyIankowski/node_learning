import { useParams } from 'react-router-dom';
import { TaskListItem } from '../components/task/TaskListItem';
import { Breadcrumbs, Card, ExternalLink, LinkButton, ProgressBar, ProgressRing } from '../components/ui';
import { getWeek, neighbours, weekPath, weeks } from '../data';
import { KIND_META, KIND_ORDER } from '../data/kinds';
import { useProgress, weekProgress } from '../store/progress';
import { NotFound } from './NotFound';
import styles from './WeekPage.module.css';

export function WeekPage() {
  const { weekId } = useParams();
  const week = getWeek(weekId);
  const completed = useProgress((s) => s.completed);
  if (!week) return <NotFound />;

  const progress = weekProgress(week, completed);
  const { prev, next } = neighbours(weeks, week);

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: 'Roadmap', to: '/' }, { label: `Week ${week.number}` }]} />
      <div className={styles.head}>
        <div className={styles.headText}>
          <div className={styles.eyebrow}>
            Week {week.number} of {weeks.length} · program week {week.programWeek}, part {week.number % 2 ? 1 : 2} of 2
          </div>
          <h1 className={styles.title}>{week.title}</h1>
        </div>
        <ProgressRing ratio={progress.ratio} size={64} stroke={5} />
      </div>

      <Card title="Goals">
        <ul className={styles.goals}>
          {week.goals.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        <div className={styles.modules}>
          {week.modules.map((m) => (
            <ExternalLink key={m.url} href={m.url}>
              Program module: {m.title}
            </ExternalLink>
          ))}
        </div>
      </Card>

      <div style={{ margin: '20px 0' }}>
        <ProgressBar progress={progress} />
      </div>

      {KIND_ORDER.map((kind) => {
        const tasks = week.tasks.filter((t) => t.kind === kind);
        if (!tasks.length) return null;
        const meta = KIND_META[kind];
        return (
          <section key={kind} className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span style={{ color: meta.cssVar }}>{meta.icon}</span>
              {meta.plural}
              <span className={styles.count}>
                {tasks.filter((t) => completed[t.id]).length}/{tasks.length}
              </span>
            </h2>
            {tasks.map((t) => (
              <TaskListItem key={t.id} task={t} weekId={week.id} />
            ))}
          </section>
        );
      })}

      <div className={styles.nav}>
        <LinkButton to={prev ? weekPath(prev.id) : '/'} disabled={!prev}>
          ← {prev ? `Week ${prev.number}` : 'Previous'}
        </LinkButton>
        <LinkButton to={next ? weekPath(next.id) : '/'} disabled={!next} variant="primary">
          {next ? `Week ${next.number}` : 'Next'} →
        </LinkButton>
      </div>
    </div>
  );
}
