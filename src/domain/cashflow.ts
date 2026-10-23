import type {
  CashflowResult,
  EquityContribution,
  Expense,
  ExpenseAllocation,
  ExtractLine,
  MonthlyBalance,
  Tranche,
} from './types';

function yearMonth(isoDate: string): string {
  return isoDate.slice(0, 7);
}

function isReleasedFor(tranche: Tranche, expenseDate: string): boolean {
  if (tranche.status !== 'released' || !tranche.releasedDate) return false;
  return tranche.releasedDate <= expenseDate;
}

function compareExpenses(a: Expense, b: Expense): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return a.id < b.id ? -1 : 1;
}

function compareTranches(a: Tranche, b: Tranche): number {
  const aDate = a.releasedDate ?? a.plannedDate;
  const bDate = b.releasedDate ?? b.plannedDate;
  if (aDate !== bDate) return aDate < bDate ? -1 : 1;
  return a.id < b.id ? -1 : 1;
}

function pushMonth(
  months: Map<string, MonthlyBalance>,
  month: string,
  patch: Partial<MonthlyBalance>,
): MonthlyBalance {
  const current = months.get(month) ?? {
    month,
    releasedThisMonth: 0,
    equityAddedThisMonth: 0,
    expensesThisMonth: 0,
    trancheDrawnThisMonth: 0,
    equityDrawnThisMonth: 0,
    trancheRemaining: 0,
    equityRemaining: 0,
    available: 0,
  };
  const next = { ...current, ...patch };
  months.set(month, next);
  return next;
}

/** Opening equity plus every contribution made so far. */
export function totalEquity(openingEquity: number, contributions: EquityContribution[]): number {
  return contributions.reduce((sum, contribution) => sum + contribution.amount, openingEquity);
}

/**
 * Walk expenses in date order. Each euro is taken from the oldest released
 * tranche that still has funds on that date; leftover euros come from equity.
 */
export function allocateExpenses(
  expenses: Expense[],
  tranches: Tranche[],
  openingEquity: number,
  contributions: EquityContribution[] = [],
): CashflowResult {
  const remaining = new Map<string, number>();
  for (const tranche of tranches) remaining.set(tranche.id, tranche.amount);

  let equityRemaining = totalEquity(openingEquity, contributions);
  const allocations: ExpenseAllocation[] = [];
  const months = new Map<string, MonthlyBalance>();
  const orderedTranches = [...tranches].sort(compareTranches);

  for (const tranche of orderedTranches) {
    if (tranche.status !== 'released' || !tranche.releasedDate) continue;
    const row = pushMonth(months, yearMonth(tranche.releasedDate), {});
    row.releasedThisMonth += tranche.amount;
  }

  for (const contribution of contributions) {
    const row = pushMonth(months, yearMonth(contribution.date), {});
    row.equityAddedThisMonth += contribution.amount;
  }

  for (const expense of [...expenses].sort(compareExpenses)) {
    let left = expense.amount;
    const splits: ExpenseAllocation['splits'] = [];
    const month = yearMonth(expense.date);
    const row = pushMonth(months, month, {});
    row.expensesThisMonth += expense.amount;

    for (const tranche of orderedTranches) {
      if (left <= 0) break;
      if (!isReleasedFor(tranche, expense.date)) continue;
      const available = remaining.get(tranche.id) ?? 0;
      if (available <= 0) continue;
      const take = Math.min(available, left);
      remaining.set(tranche.id, available - take);
      splits.push({ source: { type: 'tranche', trancheId: tranche.id }, amount: take });
      row.trancheDrawnThisMonth += take;
      left -= take;
    }

    if (left > 0) {
      equityRemaining -= left;
      splits.push({ source: { type: 'equity' }, amount: left });
      row.equityDrawnThisMonth += left;
    }

    allocations.push({ expenseId: expense.id, splits });
  }

  const snapshotMonths = [...months.keys()].sort();
  let runningTranche = 0;
  let runningEquity = openingEquity;
  const monthly: MonthlyBalance[] = [];

  for (const month of snapshotMonths) {
    const row = months.get(month);
    if (!row) continue;
    runningTranche += row.releasedThisMonth - row.trancheDrawnThisMonth;
    runningEquity += row.equityAddedThisMonth - row.equityDrawnThisMonth;
    monthly.push({
      ...row,
      trancheRemaining: runningTranche,
      equityRemaining: runningEquity,
      available: runningTranche + runningEquity,
    });
  }

  return {
    allocations,
    monthly,
    trancheRemaining: Object.fromEntries(remaining),
    equityRemaining,
  };
}

export function currentSaldo(result: CashflowResult): {
  available: number;
  trancheRemaining: number;
  equityRemaining: number;
} {
  const latest = result.monthly.at(-1);
  if (latest) {
    return {
      available: latest.available,
      trancheRemaining: latest.trancheRemaining,
      equityRemaining: latest.equityRemaining,
    };
  }
  return {
    available: result.equityRemaining,
    trancheRemaining: 0,
    equityRemaining: result.equityRemaining,
  };
}

const KIND_ORDER: Record<ExtractLine['kind'], number> = {
  opening: 0,
  contribution: 1,
  release: 2,
  expense: 3,
};

export function buildExtract(
  expenses: Expense[],
  tranches: Tranche[],
  openingEquity: number,
  contributions: EquityContribution[] = [],
): ExtractLine[] {
  const events: Array<Omit<ExtractLine, 'balance'>> = [];

  for (const contribution of contributions) {
    events.push({
      id: `contribution-${contribution.id}`,
      date: contribution.date,
      kind: 'contribution',
      sourceId: contribution.id,
      amount: contribution.amount,
    });
  }

  for (const tranche of tranches) {
    if (tranche.status !== 'released' || !tranche.releasedDate) continue;
    events.push({
      id: `release-${tranche.id}`,
      date: tranche.releasedDate,
      kind: 'release',
      sourceId: tranche.id,
      amount: tranche.amount,
    });
  }

  for (const expense of expenses) {
    events.push({
      id: `expense-${expense.id}`,
      date: expense.date,
      kind: 'expense',
      sourceId: expense.id,
      amount: -expense.amount,
    });
  }

  events.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    const kindDiff = KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
    if (kindDiff !== 0) return kindDiff;
    return a.id < b.id ? -1 : 1;
  });

  const lines: ExtractLine[] = [];
  let balance = 0;

  if (openingEquity !== 0) {
    balance = openingEquity;
    lines.push({
      id: 'opening',
      date: events[0]?.date ?? '',
      kind: 'opening',
      amount: openingEquity,
      balance,
    });
  }

  for (const event of events) {
    balance += event.amount;
    lines.push({ ...event, balance });
  }

  return lines;
}

export function primarySource(
  allocation: ExpenseAllocation | undefined,
): ExpenseAllocation['splits'][number]['source'] | undefined {
  if (!allocation || allocation.splits.length === 0) return undefined;
  return [...allocation.splits].sort((a, b) => b.amount - a.amount)[0]?.source;
}
