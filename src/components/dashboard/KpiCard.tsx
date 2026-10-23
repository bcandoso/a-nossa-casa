import { isEquityLow } from '@/domain/alerts';
import { formatMoney } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import type { Project } from '@/domain/types';
import styles from './KpiCard.module.css';

export function KpiStrip({
  project,
  releasedTotal,
  equityTotal,
  equityRemaining,
  totalDelta,
}: {
  project: Project;
  releasedTotal: number;
  equityTotal: number;
  equityRemaining: number;
  totalDelta: number;
}) {
  const over = totalDelta > 0;
  const equityLow = isEquityLow(equityTotal, equityRemaining, project.equityAlertPct);
  return (
    <div className={styles.strip}>
      <KpiCard label={pt.kpi.loan} value={project.loanTotal} hint={project.name} />
      <KpiCard
        label={pt.kpi.releasedTranches}
        value={releasedTotal}
        hint={`${pt.kpi.ofTotal} ${formatMoney(project.loanTotal)}`}
      />
      <KpiCard
        label={pt.kpi.equity}
        value={equityRemaining}
        hint={`${pt.kpi.remaining} · ${formatMoney(equityTotal)}`}
        tone={equityLow ? 'bad' : undefined}
      />
      <KpiCard
        label={pt.kpi.variance}
        value={totalDelta}
        hint={over ? pt.variance.over : pt.variance.under}
        tone={totalDelta > 0 ? 'bad' : totalDelta < 0 ? 'good' : undefined}
      />
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: 'good' | 'bad';
}) {
  const valueClass =
    tone === 'bad' ? styles.valueBad : tone === 'good' ? styles.valueGood : styles.value;
  return (
    <article className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={valueClass}>{formatMoney(value)}</div>
      <div className={styles.hint}>{hint}</div>
    </article>
  );
}
