import { useLayoutEffect, useRef } from 'react';
import { ALL_NAV_ITEMS } from '@/navigation';
import type { PageId } from '@/hooks/useHashRoute';
import { pt } from '@/i18n/pt-PT';
import styles from './NavDock.module.css';

export function NavDock({
  page,
  wide,
  onNavigate,
}: {
  page: PageId;
  wide: boolean;
  onNavigate: (page: PageId) => void;
}) {
  const navRef = useDockPill(page, wide);

  const items = ALL_NAV_ITEMS.map((item) => {
    const active = item.id === page;
    return (
      <button
        key={item.id}
        type="button"
        className={wide ? styles.itemWide : styles.itemPhone}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        data-dock-active={active ? 'true' : undefined}
        onClick={() => {
          if ('vibrate' in navigator) {
            try {
              navigator.vibrate(5);
            } catch {
              /* ignore */
            }
          }
          onNavigate(item.id);
        }}
      >
        <span className={[styles.icon, active ? styles.iconActive : ''].join(' ')}>
          <item.Icon size={wide ? 20 : 22} strokeWidth={active ? 2.4 : 2} />
        </span>
      </button>
    );
  });

  if (wide) {
    return (
      <aside className={styles.aside}>
        <nav ref={navRef} className={styles.barWide} aria-label={pt.nav.main}>
          <span className={styles.pill} aria-hidden />
          {items}
        </nav>
      </aside>
    );
  }

  return (
    <div className={styles.anchor}>
      <nav ref={navRef} className={styles.barPhone} aria-label={pt.nav.main}>
        <span className={styles.pill} aria-hidden />
        {items}
      </nav>
    </div>
  );
}

function useDockPill(activeId: string, wide: boolean) {
  const navRef = useRef<HTMLElement>(null);
  const seen = useRef(false);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const el = nav?.querySelector<HTMLElement>('[data-dock-active="true"]');
    if (!nav || !el) return undefined;

    const place = () => {
      const nb = nav.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const inset = wide ? { x: 8, y: 6 } : { x: 4, y: 11 };
      nav.style.setProperty('--pill-x', `${b.left - nb.left + inset.x}px`);
      nav.style.setProperty('--pill-y', `${b.top - nb.top + inset.y}px`);
      nav.style.setProperty('--pill-w', `${Math.max(0, b.width - inset.x * 2)}px`);
      nav.style.setProperty('--pill-h', `${Math.max(0, b.height - inset.y * 2)}px`);
    };

    place();

    if (seen.current) {
      nav.setAttribute('data-travel', wide ? 'y' : 'x');
      const timer = window.setTimeout(() => nav.removeAttribute('data-travel'), 560);
      const observer = new ResizeObserver(place);
      observer.observe(nav);
      return () => {
        window.clearTimeout(timer);
        observer.disconnect();
      };
    }

    seen.current = true;
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeId, wide]);

  return navRef;
}
