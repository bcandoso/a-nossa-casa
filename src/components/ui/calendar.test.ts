import { describe, expect, it } from 'vitest';
import { monthGrid, parseYearMonth, shiftMonth, toIsoDate } from './calendar';

describe('calendar', () => {
  it('pads the grid so day 1 lands on its Monday-first weekday', () => {
    const grid = monthGrid({ year: 2026, month: 10 });
    expect(grid.findIndex((cell) => cell.day === 1)).toBe(3);
    expect(grid.filter((cell) => cell.day !== null)).toHaveLength(31);
    expect(grid.at(-1)?.iso).toBe('2026-10-31');
  });

  it('starts a Monday month with no padding', () => {
    expect(monthGrid({ year: 2026, month: 6 })[0]?.day).toBe(1);
  });

  it('shifts months across year boundaries', () => {
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
  });

  it('falls back when the value is empty', () => {
    expect(parseYearMonth('', '2026-03-09')).toEqual({ year: 2026, month: 3 });
    expect(toIsoDate(2026, 3, 9)).toBe('2026-03-09');
  });
});
