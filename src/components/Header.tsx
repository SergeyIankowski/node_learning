import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { weeks } from '../data';
import { overallProgress, useProgress } from '../store/progress';
import styles from './Header.module.css';
import { Button, ProgressBar } from './ui';

export function Header() {
  const completed = useProgress((s) => s.completed);
  const quizResults = useProgress((s) => s.quizResults);
  const importJson = useProgress((s) => s.importJson);
  const reset = useProgress((s) => s.reset);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify({ completed, quizResults }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `node-learning-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const ok = importJson(JSON.parse(await file.text()));
      if (!ok) alert('This file does not look like an exported progress file.');
    } catch {
      alert('Could not read the file: invalid JSON.');
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const onReset = () => {
    if (confirm('Reset all progress and test results? Export first if you want a backup.')) reset();
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        <img src="/favicon.svg" alt="" className={styles.logo} />
        <span className={styles.brandText}>Node.js Roadmap</span>
      </Link>
      <div className={styles.progress} title="Overall progress">
        <ProgressBar progress={overallProgress(weeks, completed)} />
      </div>
      <div className={styles.actions}>
        <Button size="sm" variant="ghost" onClick={exportProgress}>
          Export
        </Button>
        <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
          Import
        </Button>
        <Button size="sm" variant="ghost" onClick={onReset}>
          Reset
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className={styles.file}
          onChange={(e) => onImport(e.target.files?.[0])}
        />
      </div>
    </header>
  );
}
