import { useEffect, useRef, useState } from 'react';
import styles from './PageHeader.module.css';

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const ref = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const scroller = ref.current?.closest('[data-scroll]');
    if (!(scroller instanceof HTMLElement)) return undefined;
    const onScroll = () => setCompact(scroller.scrollTop > 8);
    onScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header ref={ref} className={styles.header} data-compact={compact ? 'true' : 'false'}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  );
}
