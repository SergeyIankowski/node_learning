import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className={styles.crumbs} aria-label="Breadcrumbs">
      {items.map((item, i) => (
        <Fragment key={item.to ?? item.label}>
          {i > 0 && <span aria-hidden>/</span>}
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
        </Fragment>
      ))}
    </nav>
  );
}
