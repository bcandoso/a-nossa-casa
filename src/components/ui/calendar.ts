export interface CalendarCell {
  day: number | null;
  iso: string | null;
}

export interface YearMonth {
  year: number;
  month: number;
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function todayIso(now: Date = new Date()): string {
  return toIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function parseYearMonth(iso: string, fallback: string = todayIso()): YearMonth {
  const [year, month] = (iso || fallback).split('-').map(Number);
  if (!year || !month) return parseYearMonth(fallback, todayIso());
  return { year, month };
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** Monday-first month grid, padded with empty cells before day 1. */
export function monthGrid({ year, month }: YearMonth): CalendarCell[] {
  const jsWeekday = new Date(year, month - 1, 1).getDay();
  const lead = jsWeekday === 0 ? 6 : jsWeekday - 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = Array.from({ length: lead }, () => ({ day: null, iso: null }));
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, iso: toIsoDate(year, month, day) });
  }
  return cells;
}
