import type { BudgetItem, Category } from './types';

/** Categories with every budget item added to their base submitted budget. */
export function applyBudgetItems(categories: Category[], items: BudgetItem[]): Category[] {
  if (items.length === 0) return categories;
  const added = new Map<string, number>();
  for (const item of items) added.set(item.categoryId, (added.get(item.categoryId) ?? 0) + item.amount);
  return categories.map((category) => {
    const extra = added.get(category.id);
    return extra ? { ...category, submittedBudget: category.submittedBudget + extra } : category;
  });
}
