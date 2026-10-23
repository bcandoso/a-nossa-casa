const LOCALE = 'pt-PT';
const CURRENCY = 'EUR';

const money = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

const moneyExact = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const moneyShort = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 1,
});

const percent = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

const share = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 });

const monthFmt = new Intl.DateTimeFormat(LOCALE, { month: 'short', year: 'numeric' });
const monthLongFmt = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatMoney(value: number): string {
  return money.format(value);
}

export function formatMoneySigned(value: number): string {
  const absolute = money.format(Math.abs(value));
  if (value > 0) return `+ ${absolute}`;
  if (value < 0) return `− ${absolute}`;
  return absolute;
}

export function formatMoneyExact(value: number): string {
  return moneyExact.format(value);
}

export function formatMoneyShort(value: number): string {
  return moneyShort.format(value);
}

export function formatPercent(ratio: number): string {
  return percent.format(ratio);
}

export function formatShare(ratio: number): string {
  return share.format(ratio);
}

export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return yearMonth;
  return monthFmt.format(new Date(year, month - 1, 1));
}

export function formatMonthLong(year: number, month: number): string {
  const label = monthLongFmt.format(new Date(year, month - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return dateFmt.format(parsed);
}

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? '');
}
