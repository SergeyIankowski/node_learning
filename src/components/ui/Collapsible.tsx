import type { ReactNode } from 'react';
import styles from './Collapsible.module.css';

export function Collapsible({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <details className={styles.details}>
      <summary className={styles.summary}>{title}</summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
