import kpi from '@/components/dashboard/KpiCard.module.css';
import { Trend } from '@/components/ui/Trend';
import type { PaymentState } from '@/domain/payment';
import type { ProjectData } from '@/hooks/useProjectData';
import { useBudgetSummary } from '@/hooks/useBudgetSummary';
import { formatMoney, formatShare, interpolate } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import styles from './BudgetWidgets.module.css';

const STATES: PaymentState[] = ['paid', 'partial', 'unpaid'];

const DOT: Record<PaymentState, string> = {
  paid: styles.dotPaid,
  partial: styles.dotPartial,
  unpaid: styles.dotUnpaid,
};

export function BudgetWidgets({ data }: { data: ProjectData }) {
  const summary = useBudgetSummary(data);
  const w = pt.budget.widgets;
  const total = STATES.reduce((sum, state) => sum + summary.states[state], 0);
  const pending = summary.states.partial + summary.states.unpaid;

  return (
    <div className={kpi.strip}>
      <article className={kpi.card}>
        <div className={kpi.label}>{w.submitted}</div>
        <div className={kpi.value}>{formatMoney(summary.submitted)}</div>
        <div className={kpi.hint}>{interpolate(w.categories, { count: String(total) })}</div>
      </article>

      <article className={kpi.card}>
        <div className={kpi.label}>{w.paid}</div>
        <div className={kpi.value}>{formatMoney(summary.paid)}</div>
        <progress className={styles.progress} value={summary.paidRatio} max={1} aria-label={w.paid} />
        <div className={kpi.hint}>
          {interpolate(w.paidOf, { pct: formatShare(summary.paidRatio) })}
        </div>
      </article>

      <article className={kpi.card}>
        <div className={kpi.label}>{w.outstanding}</div>
        <div className={kpi.value}>{formatMoney(summary.outstanding)}</div>
        <ul className={styles.states} aria-label={w.states}>
          {STATES.map((state) => (
            <li key={state} className={styles.state}>
              <span className={DOT[state]} aria-hidden />
              {summary.states[state] === 1
                ? pt.payment.countOne[state]
                : interpolate(pt.payment.count[state], { count: String(summary.states[state]) })}
            </li>
          ))}
        </ul>
        <div className={kpi.hint}>
          {pending > 0 ? interpolate(w.outstandingIn, { count: String(pending) }) : w.outstandingNone}
        </div>
      </article>

      <article className={kpi.card}>
        <div className={kpi.label}>{w.deviation}</div>
        <Trend delta={summary.delta} pct={summary.deltaPct} size="lg" />
        <div className={kpi.hint}>
          {summary.overCount > 0
            ? interpolate(w.overCount, { count: String(summary.overCount) })
            : w.noneOver}
        </div>
      </article>
    </div>
  );
}
