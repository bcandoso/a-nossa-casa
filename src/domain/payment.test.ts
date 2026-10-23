import { describe, expect, it } from 'vitest';
import { paymentState, summarizeBudget } from './payment';
import type { Category, CategoryVariance } from './types';

const category = (id: string, submittedBudget: number, complete = false): Category => ({
  id,
  projectId: 'p',
  name: id,
  submittedBudget,
  color: '#000',
  sortOrder: 0,
  complete,
});

const variance = (categoryId: string, submittedBudget: number, realCost: number): CategoryVariance => ({
  categoryId,
  submittedBudget,
  realCost,
  delta: realCost - submittedBudget,
  deltaPct: 0,
  state: 'onTrack',
});

describe('paymentState', () => {
  it('is unpaid with no payments', () => {
    expect(paymentState(1000, 0, false)).toBe('unpaid');
  });

  it('is partial below the submitted budget', () => {
    expect(paymentState(1000, 400, false)).toBe('partial');
  });

  it('is paid at or above the budget, or when complete', () => {
    expect(paymentState(1000, 1000, false)).toBe('paid');
    expect(paymentState(1000, 1200, false)).toBe('paid');
    expect(paymentState(1000, 700, true)).toBe('paid');
  });
});

describe('summarizeBudget', () => {
  it('totals paid, outstanding and deviation', () => {
    const categories = [category('a', 1000), category('b', 2000), category('c', 500, true)];
    const rows = [variance('a', 1000, 1200), variance('b', 2000, 500), variance('c', 500, 400)];
    const summary = summarizeBudget(categories, rows);
    expect(summary.submitted).toBe(3500);
    expect(summary.paid).toBe(2100);
    expect(summary.outstanding).toBe(1500);
    expect(summary.delta).toBe(-1400);
    expect(summary.deltaPct).toBeCloseTo(-0.4);
    expect(summary.overCount).toBe(1);
    expect(summary.states).toEqual({ paid: 2, partial: 1, unpaid: 0 });
  });
});
