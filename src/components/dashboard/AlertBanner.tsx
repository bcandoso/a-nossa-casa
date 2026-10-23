import type { Alert } from '@/domain/types';
import { alertMessage } from '@/hooks/useAlerts';
import styles from './AlertBanner.module.css';

export function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null;
  return (
    <div className={styles.list} role="status">
      {alerts.map((alert, index) => (
        <div
          key={`${alert.kind}-${alert.categoryId ?? index}`}
          className={[styles.item, alert.kind === 'equity-low' ? styles.equity : styles.over].join(' ')}
        >
          <span className={styles.dot} />
          {alertMessage(alert)}
        </div>
      ))}
    </div>
  );
}
