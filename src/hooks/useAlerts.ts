import type { Alert } from '@/domain/types';
import { interpolate, formatMoney } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';

export function alertMessage(alert: Alert): string {
  if (alert.kind === 'category-over') {
    return interpolate(pt.alerts.categoryOver, {
      name: alert.categoryName ?? '',
      amount: formatMoney(alert.amount),
    });
  }
  return interpolate(pt.alerts.equityLow, {
    pct: String(alert.pct ?? 0),
    amount: formatMoney(alert.amount),
  });
}
