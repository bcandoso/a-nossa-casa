import { describe, expect, it } from 'vitest';
import { computeVariance, varianceState } from './variance';
import type { Category, Expense } from './types';

const category = (overrides: Partial<Category> = {}): Category => ({
  id: 'cat',
  projectId: 'p',
  name: 'Pedreiro',
  submittedBudget: 10_000,
  color: 'var(--flare-500)',
  sortOrder: 1,
  complete: false,
  ...overrides,
});

describe('varianceState', () => {
  it('flags an overrun', () => {
    expect(varianceState(10_000, 12_000, false, 15)).toBe('over');
  });

  it('flags an inflated complete category well below the submitted budget', () => {
    expect(varianceState(10_000, 6_000, true, 15)).toBe('inflated');
  });

  it('does not flag inflated when the category is still open', () => {
    expect(varianceState(10_000, 6_000, false, 15)).toBe('under');
  });

  it('treats a small gap as on track', () => {
    expect(varianceState(10_000, 9_900, false, 15)).toBe('onTrack');
  });
});

describe('computeVariance', () => {
  it('sums expenses per category', () => {
    const expenses: Expense[] = [
      { id: 'e1', projectId: 'p', providerId: 'a', categoryId: 'cat', amount: 4_000, date: '2026-01-01' },
      { id: 'e2', projectId: 'p', providerId: 'a', categoryId: 'cat', amount: 7_000, date: '2026-02-01' },
    ];
    const [row] = computeVariance([category()], expenses, 15);
    expect(row?.realCost).toBe(11_000);
    expect(row?.delta).toBe(1_000);
    expect(row?.state).toBe('over');
  });
});
