import type { ReactNode } from 'react';
import { Badge } from './Badge';

export function ExternalLink({ href, children, lang }: { href: string; children: ReactNode; lang?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
      <span aria-hidden> ↗</span>
      {lang && (
        <>
          {' '}
          <Badge color="var(--active)">{lang}</Badge>
        </>
      )}
    </a>
  );
}
