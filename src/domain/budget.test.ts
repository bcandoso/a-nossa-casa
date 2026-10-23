import { describe, expect, it } from 'vitest';
import { applyBudgetItems } from './budget';
import type { BudgetItem, Category } from './types';

const category = (id: string, submittedBudget: number): Category => ({
  id,
  projectId: 'p',
  name: id,
  submittedBudget,
  color: '',
  sortOrder: 0,
  complete: false,
});

const item = (id: string, categoryId: string, amount: number): BudgetItem => ({
  id,
  projectId: 'p',
  categoryId,
  amount,
  date: '2026-01-01',
});

describe('applyBudgetItems', () => {
  it('adds every item to its category and leaves the rest untouched', () => {
    const [a, b] = applyBudgetItems(
      [category('a', 1_000), category('b', 500)],
      [item('i1', 'a', 200), item('i2', 'a', 300)],
    );
    expect(a?.submittedBudget).toBe(1_500);
    expect(b?.submittedBudget).toBe(500);
  });
});
