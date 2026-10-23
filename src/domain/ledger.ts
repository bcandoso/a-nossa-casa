import type { BudgetItem, Category, CategoryVariance, Expense, Id, ParsedDocument } from './types';

export type LedgerEntryKind = 'budget' | 'invoice' | 'expense';

export interface LedgerEntry {
  id: string;
  kind: LedgerEntryKind;
  date: string;
  amount: number;
  providerId?: Id;
  fileName?: string;
  documentId?: Id;
  /** Present for payments, so they can be removed or traced to a funding source. */
  expenseId?: Id;
  budgetItemId?: Id;
}

export interface LedgerRow {
  category: Category;
  variance: CategoryVariance | undefined;
  entries: LedgerEntry[];
}

/**
 * One row per category with its budget items and payments nested underneath,
 * oldest first. Entries backed by an uploaded file keep the file name so the
 * row can show where the number came from.
 */
export function buildLedger(
  categories: Category[],
  variance: CategoryVariance[],
  expenses: Expense[],
  documents: ParsedDocument[],
  budgetItems: BudgetItem[] = [],
): LedgerRow[] {
  const varianceById = new Map(variance.map((row) => [row.categoryId, row]));
  const documentById = new Map(documents.map((doc) => [doc.id, doc]));
  const entriesByCategory = new Map<Id, LedgerEntry[]>();

  const push = (categoryId: Id, entry: LedgerEntry) => {
    const list = entriesByCategory.get(categoryId) ?? [];
    list.push(entry);
    entriesByCategory.set(categoryId, list);
  };

  for (const item of budgetItems) {
    const doc = item.documentId ? documentById.get(item.documentId) : undefined;
    push(item.categoryId, {
      id: `budget-${item.id}`,
      kind: 'budget',
      date: item.date,
      amount: item.amount,
      providerId: item.providerId,
      fileName: doc?.fileName,
      documentId: doc?.id,
      budgetItemId: item.id,
    });
  }

  for (const expense of expenses) {
    const doc = expense.documentId ? documentById.get(expense.documentId) : undefined;
    push(expense.categoryId, {
      id: `expense-${expense.id}`,
      kind: doc ? 'invoice' : 'expense',
      date: expense.date,
      amount: expense.amount,
      providerId: expense.providerId,
      fileName: doc?.fileName,
      documentId: doc?.id,
      expenseId: expense.id,
    });
  }

  return categories.map((category) => ({
    category,
    variance: varianceById.get(category.id),
    entries: (entriesByCategory.get(category.id) ?? []).sort((a, b) =>
      a.date === b.date ? a.id.localeCompare(b.id) : a.date < b.date ? -1 : 1,
    ),
  }));
}
