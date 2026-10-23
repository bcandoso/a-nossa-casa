import { IDS } from '@/domain/ids';
import { formatDate, interpolate } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import type { ProjectData } from '@/hooks/useProjectData';
import styles from './StatusFooter.module.css';

function latestStamp(data: ProjectData): string | null {
  let latest = '';
  for (const expense of data.expenses) {
    if (expense.date > latest) latest = expense.date;
  }
  for (const document of data.documents) {
    if (document.uploadedAt > latest) latest = document.uploadedAt;
  }
  return latest || null;
}

function formatStamp(value: string): string {
  if (value.includes('T')) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(parsed);
    }
  }
  return formatDate(value.slice(0, 10));
}

export function StatusFooter({ data }: { data: ProjectData }) {
  const stamp = latestStamp(data);
  const demo = data.project?.id === IDS.project;

  return (
    <footer className={styles.bar}>
      <span className={styles.live}>
        <span className={styles.liveDot} aria-hidden />
        {pt.footer.local}
      </span>
      {stamp ? <span>{interpolate(pt.footer.lastChange, { date: formatStamp(stamp) })}</span> : null}
      {demo ? <span className={styles.badge}>{pt.footer.demo}</span> : null}
    </footer>
  );
}
