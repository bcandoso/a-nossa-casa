import type { Category, CategoryVariance, Id } from './types';

export type PaymentState = 'paid' | 'partial' | 'unpaid';

/** A category is paid once it is marked complete or payments reach its submitted budget. */
export function paymentState(submittedBudget: number, paid: number, complete: boolean): PaymentState {
  if (paid <= 0) return complete ? 'paid' : 'unpaid';
  if (complete || paid >= submittedBudget) return 'paid';
  return 'partial';
}

export interface BudgetSummary {
  submitted: number;
  paid: number;
  outstanding: number;
  paidRatio: number;
  delta: number;
  deltaPct: number;
  overCount: number;
  states: Record<PaymentState, number>;
  stateById: Map<Id, PaymentState>;
}

export function summarizeBudget(categories: Category[], variance: CategoryVariance[]): BudgetSummary {
  const varianceById = new Map(variance.map((row) => [row.categoryId, row]));
  const states: Record<PaymentState, number> = { paid: 0, partial: 0, unpaid: 0 };
  const stateById = new Map<Id, PaymentState>();
  let submitted = 0;
  let paid = 0;
  let outstanding = 0;
  let overCount = 0;

  for (const category of categories) {
    const realCost = varianceById.get(category.id)?.realCost ?? 0;
    const state = paymentState(category.submittedBudget, realCost, category.complete);
    states[state] += 1;
    stateById.set(category.id, state);
    submitted += category.submittedBudget;
    paid += realCost;
    if (state !== 'paid') outstanding += Math.max(category.submittedBudget - realCost, 0);
    if (realCost > category.submittedBudget) overCount += 1;
  }

  const delta = paid - submitted;
  return {
    submitted,
    paid,
    outstanding,
    paidRatio: submitted > 0 ? Math.min(paid / submitted, 1) : 0,
    delta,
    deltaPct: submitted > 0 ? delta / submitted : 0,
    overCount,
    states,
    stateById,
  };
}
