import type {
  Category,
  Expense,
  ExpenseAllocation,
  FundingFlowGraph,
  Provider,
  SankeyLinkInput,
  SankeyNodeInput,
  Tranche,
} from './types';

const LOAN_UNRELEASED = 'loan-unreleased';
const EQUITY = 'equity';
const AVAILABLE = 'available';

export interface FundingFlowLabels {
  equity: string;
  unreleased: string;
  available: string;
}

function addLink(links: Map<string, SankeyLinkInput>, source: string, target: string, value: number): void {
  if (value <= 0) return;
  const key = `${source}→${target}`;
  const existing = links.get(key);
  if (existing) {
    existing.value += value;
    return;
  }
  links.set(key, { source, target, value });
}

function trancheNodeId(id: string): string {
  return `tranche:${id}`;
}

function categoryNodeId(id: string): string {
  return `category:${id}`;
}

function providerNodeId(id: string): string {
  return `provider:${id}`;
}

/**
 * Three columns: funding sources (released tranches, leftover loan, equity),
 * budget categories plus unused funds, then expenses grouped by provider.
 */
export function buildFundingFlow(input: {
  loanTotal: number;
  equityTotal: number;
  tranches: Tranche[];
  categories: Category[];
  providers: Provider[];
  expenses: Expense[];
  allocations: ExpenseAllocation[];
  labels: FundingFlowLabels;
}): FundingFlowGraph {
  const { loanTotal, equityTotal, tranches, categories, providers, expenses, allocations, labels } = input;
  const allocationByExpense = new Map(allocations.map((row) => [row.expenseId, row]));
  const links = new Map<string, SankeyLinkInput>();
  const sourceSpent = new Map<string, number>();

  const released = tranches.filter((tranche) => tranche.status === 'released');
  const releasedTotal = released.reduce((sum, tranche) => sum + tranche.amount, 0);
  const unreleased = Math.max(0, loanTotal - releasedTotal);

  for (const expense of expenses) {
    const allocation = allocationByExpense.get(expense.id);
    if (!allocation) continue;
    const categoryId = categoryNodeId(expense.categoryId);
    const providerId = providerNodeId(expense.providerId);

    for (const split of allocation.splits) {
      const sourceId =
        split.source.type === 'equity' ? EQUITY : trancheNodeId(split.source.trancheId ?? '');
      addLink(links, sourceId, categoryId, split.amount);
      sourceSpent.set(sourceId, (sourceSpent.get(sourceId) ?? 0) + split.amount);
    }
    addLink(links, categoryId, providerId, expense.amount);
  }

  for (const tranche of released) {
    const id = trancheNodeId(tranche.id);
    const unused = tranche.amount - (sourceSpent.get(id) ?? 0);
    addLink(links, id, AVAILABLE, unused);
  }
  addLink(links, LOAN_UNRELEASED, AVAILABLE, unreleased);
  addLink(links, EQUITY, AVAILABLE, equityTotal - (sourceSpent.get(EQUITY) ?? 0));

  const nodes: SankeyNodeInput[] = [];

  for (const tranche of released) {
    nodes.push({
      id: trancheNodeId(tranche.id),
      label: tranche.label,
      color: 'var(--flow-loan)',
      displayValue: tranche.amount,
    });
  }

  if (unreleased > 0) {
    nodes.push({
      id: LOAN_UNRELEASED,
      label: labels.unreleased,
      color: 'var(--flow-unreleased)',
      displayValue: unreleased,
    });
  }

  nodes.push({
    id: EQUITY,
    label: labels.equity,
    color: 'var(--flow-equity)',
    displayValue: equityTotal,
  });

  for (const category of [...categories].sort((a, b) => a.sortOrder - b.sortOrder)) {
    nodes.push({
      id: categoryNodeId(category.id),
      label: category.name,
      color: category.color,
      displayValue: category.submittedBudget,
    });
  }

  nodes.push({
    id: AVAILABLE,
    label: labels.available,
    color: 'var(--flow-unreleased)',
  });

  const usedProviders = new Set(expenses.map((expense) => expense.providerId));
  for (const provider of providers) {
    if (!usedProviders.has(provider.id)) continue;
    nodes.push({
      id: providerNodeId(provider.id),
      label: provider.name,
      color: 'var(--flow-expense)',
    });
  }

  return { nodes, links: [...links.values()] };
}
