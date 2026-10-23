import type { ReactNode } from 'react';
import type { Appearance } from '@/hooks/useAppearance';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import type { PageId } from '@/hooks/useHashRoute';
import type { ProjectData } from '@/hooks/useProjectData';
import { pt } from '@/i18n/pt-PT';
import { Header } from './Header';
import { NavDock } from './NavDock';
import { StatusFooter } from './StatusFooter';
import styles from './AppShell.module.css';

export function AppShell({
  page,
  projectName,
  ready,
  data,
  appearance,
  onNavigate,
  children,
}: {
  page: PageId;
  projectName: string;
  ready: boolean;
  data: ProjectData;
  appearance: Appearance;
  onNavigate: (page: PageId) => void;
  children: ReactNode;
}) {
  const { wide } = useBreakpoint();

  return (
    <div className={`app-page ${wide ? styles.pageWide : styles.pagePhone}`}>
      {wide ? <NavDock page={page} wide onNavigate={onNavigate} /> : null}
      <div className={styles.shell}>
        <Header
          projectName={projectName}
          appearance={appearance}
          categories={data.categories}
          providers={data.providers}
          onNavigate={onNavigate}
        />
        <main className={wide ? styles.mainWide : styles.mainPhone} data-scroll>
          {ready ? (
            <div key={page} className={styles.view}>
              {children}
            </div>
          ) : (
            <p className={styles.loading}>{pt.common.loading}</p>
          )}
        </main>
        <StatusFooter data={data} />
      </div>
      {wide ? null : <NavDock page={page} wide={false} onNavigate={onNavigate} />}
    </div>
  );
}
