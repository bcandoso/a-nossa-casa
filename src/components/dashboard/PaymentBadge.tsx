import type { PaymentState } from '@/domain/payment';
import { pt } from '@/i18n/pt-PT';
import styles from './PaymentBadge.module.css';

const TONE: Record<PaymentState, string> = {
  paid: styles.paid,
  partial: styles.partial,
  unpaid: styles.unpaid,
};

export function PaymentBadge({ state }: { state: PaymentState }) {
  return (
    <span className={[styles.badge, TONE[state]].join(' ')}>
      <span className={styles.dot} aria-hidden />
      {pt.payment[state]}
    </span>
  );
}
