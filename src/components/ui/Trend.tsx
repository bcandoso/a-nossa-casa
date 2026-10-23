import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { formatMoneySigned, formatPercent } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import styles from './Trend.module.css';

/** Cost deviation: above budget trends up in red, below budget trends down in green. */
export function Trend({ delta, pct, size = 'md' }: { delta: number; pct: number; size?: 'md' | 'lg' }) {
  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
  const label = `${pt.trend[direction]} · ${formatMoneySigned(delta)}`;
  return (
    <span className={[styles.trend, styles[direction], styles[size]].join(' ')} title={label} aria-label={label}>
      <Icon size={size === 'lg' ? 22 : 14} aria-hidden />
      {formatPercent(pct)}
    </span>
  );
}
