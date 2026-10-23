import { describe, expect, it } from 'vitest';
import { allocateExpenses, buildExtract, currentSaldo, totalEquity } from './cashflow';
import type { EquityContribution, Expense, Tranche } from './types';

function contribution(id: string, amount: number, date: string): EquityContribution {
  return { id, projectId: 'p', label: id, amount, date };
}

function tranche(partial: Partial<Tranche> & Pick<Tranche, 'id' | 'amount' | 'status'>): Tranche {
  return {
    projectId: 'p',
    label: partial.id,
    plannedDate: '2026-01-01',
    ...partial,
  };
}

function expense(partial: Partial<Expense> & Pick<Expense, 'id' | 'amount' | 'date'>): Expense {
  return {
    projectId: 'p',
    providerId: 'prov',
    categoryId: 'cat',
    ...partial,
  };
}

describe('allocateExpenses', () => {
  it('draws from equity when no tranche is released', () => {
    const result = allocateExpenses(
      [expense({ id: 'e1', amount: 1_000, date: '2026-02-01' })],
      [tranche({ id: 't1', amount: 5_000, status: 'planned' })],
      4_000,
    );

    expect(result.allocations[0]?.splits).toEqual([{ source: { type: 'equity' }, amount: 1_000 }]);
    expect(result.equityRemaining).toBe(3_000);
    expect(result.monthly[0]?.equityDrawnThisMonth).toBe(1_000);
  });

  it('draws from the oldest released tranche first', () => {
    const result = allocateExpenses(
      [expense({ id: 'e1', amount: 2_000, date: '2026-03-01' })],
      [
        tranche({ id: 't1', amount: 5_000, status: 'released', releasedDate: '2026-01-15' }),
        tranche({ id: 't2', amount: 5_000, status: 'released', releasedDate: '2026-02-15' }),
      ],
      1_000,
    );

    expect(result.allocations[0]?.splits).toEqual([
      { source: { type: 'tranche', trancheId: 't1' }, amount: 2_000 },
    ]);
    expect(result.trancheRemaining.t1).toBe(3_000);
    expect(result.equityRemaining).toBe(1_000);
  });

  it('splits an expense across a depleted tranche and equity', () => {
    const result = allocateExpenses(
      [expense({ id: 'e1', amount: 8_000, date: '2026-02-01' })],
      [tranche({ id: 't1', amount: 5_000, status: 'released', releasedDate: '2026-01-01' })],
      10_000,
    );

    expect(result.allocations[0]?.splits).toEqual([
      { source: { type: 'tranche', trancheId: 't1' }, amount: 5_000 },
      { source: { type: 'equity' }, amount: 3_000 },
    ]);
    expect(result.equityRemaining).toBe(7_000);
  });

  it('ignores a tranche released after the expense date', () => {
    const result = allocateExpenses(
      [expense({ id: 'e1', amount: 1_000, date: '2026-01-10' })],
      [tranche({ id: 't1', amount: 5_000, status: 'released', releasedDate: '2026-02-01' })],
      2_000,
    );

    expect(result.allocations[0]?.splits[0]?.source).toEqual({ type: 'equity' });
  });

  it('builds monthly balances that accumulate remaining funds', () => {
    const result = allocateExpenses(
      [
        expense({ id: 'e1', amount: 1_000, date: '2026-01-20' }),
        expense({ id: 'e2', amount: 2_000, date: '2026-02-10' }),
      ],
      [tranche({ id: 't1', amount: 4_000, status: 'released', releasedDate: '2026-01-15' })],
      500,
    );

    const jan = result.monthly.find((row) => row.month === '2026-01');
    const feb = result.monthly.find((row) => row.month === '2026-02');
    expect(jan?.releasedThisMonth).toBe(4_000);
    expect(jan?.trancheRemaining).toBe(3_000);
    expect(feb?.expensesThisMonth).toBe(2_000);
    expect(feb?.trancheRemaining).toBe(1_000);
    expect(feb?.available).toBe(1_500);
    expect(currentSaldo(result)).toEqual({
      available: 1_500,
      trancheRemaining: 1_000,
      equityRemaining: 500,
    });
  });

  it('treats unused equity as the current saldo when nothing has moved', () => {
    const result = allocateExpenses([], [], 8_000);
    expect(currentSaldo(result)).toEqual({
      available: 8_000,
      trancheRemaining: 0,
      equityRemaining: 8_000,
    });
  });
});

describe('buildExtract', () => {
  it('opens with equity then applies credits and debits in date order', () => {
    const lines = buildExtract(
      [
        expense({ id: 'e1', amount: 1_000, date: '2026-01-20' }),
        expense({ id: 'e2', amount: 2_000, date: '2026-02-10' }),
      ],
      [tranche({ id: 't1', amount: 4_000, status: 'released', releasedDate: '2026-01-15' })],
      500,
    );

    expect(lines.map((line) => [line.kind, line.amount, line.balance])).toEqual([
      ['opening', 500, 500],
      ['release', 4_000, 4_500],
      ['expense', -1_000, 3_500],
      ['expense', -2_000, 1_500],
    ]);
  });

  it('books a same-day release before expenses so the saldo can cover them', () => {
    const lines = buildExtract(
      [expense({ id: 'e1', amount: 3_000, date: '2026-01-15' })],
      [tranche({ id: 't1', amount: 4_000, status: 'released', releasedDate: '2026-01-15' })],
      0,
    );

    expect(lines[0]?.kind).toBe('release');
    expect(lines[1]?.kind).toBe('expense');
    expect(lines[1]?.balance).toBe(1_000);
  });
});

describe('equity contributions', () => {
  const contributions = [contribution('c1', 5_000, '2026-03-01'), contribution('c2', 2_000, '2026-05-10')];

  it('adds every contribution to the opening equity', () => {
    expect(totalEquity(10_000, contributions)).toBe(17_000);
    expect(totalEquity(10_000, [])).toBe(10_000);
  });

  it('grows the monthly equity balance in the month of the contribution', () => {
    const result = allocateExpenses(
      [expense({ id: 'e1', amount: 4_000, date: '2026-02-10' })],
      [],
      10_000,
      contributions,
    );
    expect(result.monthly.map((row) => [row.month, row.equityRemaining])).toEqual([
      ['2026-02', 6_000],
      ['2026-03', 11_000],
      ['2026-05', 13_000],
    ]);
    expect(result.equityRemaining).toBe(13_000);
    expect(currentSaldo(result).available).toBe(13_000);
  });

  it('books contributions as credits in the extract', () => {
    const lines = buildExtract(
      [expense({ id: 'e1', amount: 1_000, date: '2026-03-01' })],
      [],
      10_000,
      [contribution('c1', 5_000, '2026-03-01')],
    );
    expect(lines.map((line) => [line.kind, line.amount, line.balance])).toEqual([
      ['opening', 10_000, 10_000],
      ['contribution', 5_000, 15_000],
      ['expense', -1_000, 14_000],
    ]);
  });
});
