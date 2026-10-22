import type { Progress } from '../../store/progress';
import styles from './ProgressBar.module.css';

export function ProgressBar({ progress, showLabel = true }: { progress: Progress; showLabel?: boolean }) {
  const pct = Math.round(progress.ratio * 100);
  return (
    <div className={styles.wrap}>
      <div className={styles.track} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className={styles.label}>
          {progress.done}/{progress.total} · {pct}%
        </span>
      )}
    </div>
  );
}
