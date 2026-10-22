import { useState } from 'react';
import { Button } from './Button';
import styles from './CodeBlock.module.css';

export function CodeBlock({ code, copyable = true }: { code: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard can be unavailable; ignore */
    }
  };
  return (
    <div className={styles.wrap}>
      <pre>
        <code>{code}</code>
      </pre>
      {copyable && (
        <Button size="sm" variant="ghost" className={styles.copy} onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      )}
    </div>
  );
}
