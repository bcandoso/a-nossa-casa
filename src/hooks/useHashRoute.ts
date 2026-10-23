import { useEffect, useState } from 'react';

export const PAGES = ['dashboard', 'budget', 'funding', 'settings'] as const;

export type PageId = (typeof PAGES)[number];

const LEGACY: Record<string, PageId> = { documents: 'budget', reports: 'dashboard' };

function parseHash(hash: string): PageId {
  const value = hash.replace(/^#\/?/, '');
  if (LEGACY[value]) return LEGACY[value];
  return (PAGES as readonly string[]).includes(value) ? (value as PageId) : 'dashboard';
}

export function useHashRoute(): [PageId, (page: PageId) => void] {
  const [page, setPage] = useState<PageId>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHash = () => setPage(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (next: PageId) => {
    window.location.hash = `/${next}`;
    setPage(next);
  };

  return [page, navigate];
}
