import type { Category, CategoryVariance, Expense, VarianceState } from './types';

const ON_TRACK_BAND = 0.02;

export function categoryRealCost(expenses: Expense[], categoryId: string): number {
  return expenses
    .filter((expense) => expense.categoryId === categoryId)
    .reduce((sum, expense) => sum + expense.amount, 0);
}

export function varianceState(
  submittedBudget: number,
  realCost: number,
  complete: boolean,
  inflatedVariancePct: number,
): VarianceState {
  if (submittedBudget <= 0) {
    return realCost > 0 ? 'over' : 'onTrack';
  }

  const deltaPct = (realCost - submittedBudget) / submittedBudget;
  if (deltaPct > 0) return 'over';

  const shortfallPct = -deltaPct;
  if (complete && shortfallPct >= inflatedVariancePct / 100) return 'inflated';
  if (Math.abs(deltaPct) <= ON_TRACK_BAND) return 'onTrack';
  return 'under';
}

export function computeVariance(
  categories: Category[],
  expenses: Expense[],
  inflatedVariancePct: number,
): CategoryVariance[] {
  return [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => {
      const realCost = categoryRealCost(expenses, category.id);
      const delta = realCost - category.submittedBudget;
      const deltaPct = category.submittedBudget > 0 ? delta / category.submittedBudget : 0;
      return {
        categoryId: category.id,
        submittedBudget: category.submittedBudget,
        realCost,
        delta,
        deltaPct,
        state: varianceState(
          category.submittedBudget,
          realCost,
          category.complete,
          inflatedVariancePct,
        ),
      };
    });
}

export function totalVariance(rows: CategoryVariance[]): number {
  return rows.reduce((sum, row) => sum + row.delta, 0);
}
