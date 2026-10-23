import { currentSaldo } from '@/domain/cashflow';
import type { CashflowResult } from '@/domain/types';
import { formatMoney } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import styles from './SaldoWidget.module.css';

export function SaldoWidget({ cashflow }: { cashflow: CashflowResult }) {
  const saldo = currentSaldo(cashflow);
  const negative = saldo.available < 0;

  return (
    <article className={styles.widget}>
      <div className={styles.copy}>
        <p className={styles.label}>{pt.kpi.saldo}</p>
        <p className={negative ? styles.valueBad : styles.value}>{formatMoney(saldo.available)}</p>
        <p className={styles.hint}>{pt.kpi.saldoHint}</p>
      </div>
      <dl className={styles.split}>
        <div>
          <dt>{pt.kpi.fromTranches}</dt>
          <dd>{formatMoney(saldo.trancheRemaining)}</dd>
        </div>
        <div>
          <dt>{pt.kpi.fromEquity}</dt>
          <dd>{formatMoney(saldo.equityRemaining)}</dd>
        </div>
      </dl>
    </article>
  );
}
