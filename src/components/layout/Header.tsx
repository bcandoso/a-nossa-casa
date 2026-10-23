import { useEffect, useMemo, useRef, useState } from 'react';
import { Moon, Search, Sun } from 'lucide-react';
import type { Appearance } from '@/hooks/useAppearance';
import type { PageId } from '@/hooks/useHashRoute';
import type { Category, Provider } from '@/domain/types';
import { ALL_NAV_ITEMS } from '@/navigation';
import { interpolate } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import styles from './Header.module.css';

type Hit = {
  id: string;
  title: string;
  sub: string;
  page: PageId;
  group: 'pages' | 'categories' | 'providers';
};

function fold(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function Header({
  projectName,
  appearance,
  categories,
  providers,
  onNavigate,
}: {
  projectName: string;
  appearance: Appearance;
  categories: Category[];
  providers: Provider[];
  onNavigate: (page: PageId) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

  const hits = useMemo(() => {
    const needle = fold(query.trim());
    if (!needle) return [];
    const pages: Hit[] = ALL_NAV_ITEMS.filter(
      (item) => fold(item.label).includes(needle) || fold(item.sub).includes(needle),
    ).map((item) => ({
      id: `page-${item.id}`,
      title: item.label,
      sub: item.sub,
      page: item.id,
      group: 'pages',
    }));
    const cats: Hit[] = categories
      .filter((item) => fold(item.name).includes(needle))
      .map((item) => ({
        id: `cat-${item.id}`,
        title: item.name,
        sub: pt.header.categories,
        page: 'budget',
        group: 'categories',
      }));
    const provs: Hit[] = providers
      .filter((item) => fold(`${item.name} ${item.nif}`).includes(needle))
      .map((item) => ({
        id: `prov-${item.id}`,
        title: item.name,
        sub: item.nif || pt.header.providers,
        page: 'budget',
        group: 'providers',
      }));
    return [...pages, ...cats, ...provs].slice(0, 12);
  }, [categories, providers, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === 'Escape') {
        setQuery('');
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (hit: Hit) => {
    onNavigate(hit.page);
    setQuery('');
    setOpen(false);
  };

  const groups: Array<Hit['group']> = ['pages', 'categories', 'providers'];
  const groupLabel: Record<Hit['group'], string> = {
    pages: pt.header.pages,
    categories: pt.header.categories,
    providers: pt.header.providers,
  };

  return (
    <header className={styles.bar}>
      <div className={styles.brandBlock}>
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={28} height={28} className={styles.glyph} />
        <div className={styles.titles}>
          <span className={styles.brand}>{pt.appName}</span>
          <span className={styles.project}>{projectName}</span>
        </div>
      </div>

      <div className={styles.searchWrap}>
        <label className={styles.search} htmlFor="obraflow-search">
          <Search size={16} className={styles.searchIcon} aria-hidden />
          <input
            ref={inputRef}
            id="obraflow-search"
            className={styles.input}
            value={query}
            aria-label={pt.header.search}
            placeholder={pt.header.search}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && hits[0]) {
                event.preventDefault();
                go(hits[0]);
              }
            }}
          />
          <kbd className={styles.kbd}>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
        </label>
        {open && query.trim() ? (
          <div className={styles.results} role="listbox">
            {hits.length === 0 ? (
              <p className={styles.empty}>{interpolate(pt.header.noResults, { query: query.trim() })}</p>
            ) : (
              groups.map((group) => {
                const rows = hits.filter((hit) => hit.group === group);
                if (!rows.length) return null;
                return (
                  <div key={group} className={styles.group}>
                    <p className={styles.groupLabel}>{groupLabel[group]}</p>
                    {rows.map((hit) => (
                      <button
                        key={hit.id}
                        type="button"
                        className={styles.hit}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => go(hit)}
                      >
                        <span>{hit.title}</span>
                        <span className={styles.hitSub}>{hit.sub}</span>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconBtn}
          aria-label={appearance.theme === 'dark' ? pt.appearance.toLight : pt.appearance.toDark}
          title={appearance.theme === 'dark' ? pt.appearance.toLight : pt.appearance.toDark}
          onClick={appearance.toggleTheme}
        >
          {appearance.theme === 'dark' ? (
            <Sun size={18} className={styles.sun} />
          ) : (
            <Moon size={18} className={styles.moon} />
          )}
        </button>
      </div>
    </header>
  );
}
