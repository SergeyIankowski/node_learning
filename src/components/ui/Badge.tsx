import type { CSSProperties, ReactNode } from 'react';
import styles from './Badge.module.css';

export function Badge({ children, color, title }: { children: ReactNode; color?: string; title?: string }) {
  return (
    <span
      className={styles.badge}
      title={title}
      style={color ? ({ '--badge-color': color } as CSSProperties) : undefined}
    >
      {children}
    </span>
  );
}
