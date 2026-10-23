import { db, ensureSeed } from './db';
import type {
  BudgetItem,
  Category,
  EquityContribution,
  Expense,
  ParsedDocument,
  Project,
  Provider,
  Tranche,
} from '@/domain/types';

export async function loadWorkspace() {
  await ensureSeed();
  const project = (await db.projects.toCollection().first()) ?? null;
  if (!project) {
    return {
      project: null,
      tranches: [] as Tranche[],
      contributions: [] as EquityContribution[],
      categories: [] as Category[],
      budgetItems: [] as BudgetItem[],
      providers: [] as Provider[],
      expenses: [] as Expense[],
      documents: [] as ParsedDocument[],
    };
  }
  const projectId = project.id;
  const [tranches, contributions, categories, budgetItems, providers, expenses, documents] = await Promise.all([
    db.tranches.where('projectId').equals(projectId).toArray(),
    db.equityContributions.where('projectId').equals(projectId).sortBy('date'),
    db.categories.where('projectId').equals(projectId).sortBy('sortOrder'),
    db.budgetItems.where('projectId').equals(projectId).sortBy('date'),
    db.providers.where('projectId').equals(projectId).toArray(),
    db.expenses.where('projectId').equals(projectId).sortBy('date'),
    db.documents.where('projectId').equals(projectId).sortBy('uploadedAt'),
  ]);
  documents.reverse();
  return { project, tranches, contributions, categories, budgetItems, providers, expenses, documents };
}

export async function saveProject(project: Project): Promise<void> {
  await db.projects.put(project);
}

export async function saveTranche(tranche: Tranche): Promise<void> {
  await db.tranches.put(tranche);
}

export async function removeTranche(id: string): Promise<void> {
  await db.tranches.delete(id);
}

export async function saveContribution(contribution: EquityContribution): Promise<void> {
  await db.equityContributions.put(contribution);
}

export async function removeContribution(id: string): Promise<void> {
  await db.equityContributions.delete(id);
}

export async function saveCategory(category: Category): Promise<void> {
  await db.categories.put(category);
}

/** Deletes the category with its payments, quotes and their files, and unlinks it from providers. */
export async function removeCategory(id: string): Promise<void> {
  await db.transaction('rw', [db.categories, db.expenses, db.budgetItems, db.documents, db.providers], async () => {
    const expenses = await db.expenses.where('categoryId').equals(id).toArray();
    const items = await db.budgetItems.where('categoryId').equals(id).toArray();
    const documentIds = [...expenses, ...items].flatMap((row) => (row.documentId ? [row.documentId] : []));
    await db.documents.bulkDelete(documentIds);
    await db.expenses.bulkDelete(expenses.map((row) => row.id));
    await db.budgetItems.bulkDelete(items.map((row) => row.id));
    const linked = (await db.providers.toArray()).filter((provider) => provider.categoryIds.includes(id));
    await db.providers.bulkPut(
      linked.map((provider) => ({ ...provider, categoryIds: provider.categoryIds.filter((categoryId) => categoryId !== id) })),
    );
    await db.categories.delete(id);
  });
}

export async function countCategoryEntries(id: string): Promise<number> {
  const [expenses, items] = await Promise.all([
    db.expenses.where('categoryId').equals(id).count(),
    db.budgetItems.where('categoryId').equals(id).count(),
  ]);
  return expenses + items;
}

export async function saveBudgetItem(item: BudgetItem): Promise<void> {
  await db.budgetItems.put(item);
}

export async function removeBudgetItem(id: string): Promise<void> {
  await db.transaction('rw', [db.budgetItems, db.documents], async () => {
    const item = await db.budgetItems.get(id);
    if (item?.documentId) await db.documents.delete(item.documentId);
    await db.budgetItems.delete(id);
  });
}

export async function saveProvider(provider: Provider): Promise<void> {
  await db.providers.put(provider);
}

export function countProviderPayments(id: string): Promise<number> {
  return db.expenses.where('providerId').equals(id).count();
}

export async function removeProvider(id: string): Promise<void> {
  await db.providers.delete(id);
}

export async function saveExpense(expense: Expense): Promise<void> {
  await db.expenses.put(expense);
}

export async function removeExpense(id: string): Promise<void> {
  await db.transaction('rw', [db.expenses, db.documents], async () => {
    const expense = await db.expenses.get(id);
    if (expense?.documentId) await db.documents.delete(expense.documentId);
    await db.expenses.delete(id);
  });
}

export async function saveDocument(document: ParsedDocument): Promise<void> {
  await db.documents.put(document);
}

export async function removeDocument(id: string): Promise<void> {
  await db.documents.delete(id);
}
