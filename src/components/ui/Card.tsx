import type { ReactNode } from 'react';
import styles from './Card.module.css';

export function Card({
  title,
  hint,
  children,
  className,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')}>
      {(title || hint) && (
        <header className={styles.head}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {hint ? <p className={styles.hint}>{hint}</p> : null}
        </header>
      )}
      {children}
    </section>
  );
}
