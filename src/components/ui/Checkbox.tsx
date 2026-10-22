import type { ReactNode } from 'react';
import styles from './Checkbox.module.css';

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  size?: 'md' | 'lg';
  ariaLabel?: string;
};

export function Checkbox({ checked, onChange, label, size = 'md', ariaLabel }: Props) {
  return (
    <label className={[styles.label, size === 'lg' && styles.lg].filter(Boolean).join(' ')}>
      <input
        type="checkbox"
        className={styles.input}
        checked={checked}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.box} aria-hidden>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          fill="none"
          stroke="#0b120d"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6.5 5 9.2 10 3" />
        </svg>
      </span>
      {label}
    </label>
  );
}
