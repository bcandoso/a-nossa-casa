import Dexie, { type Table } from 'dexie';
import {
  demoCategories,
  demoDocuments,
  demoExpenses,
  demoProject,
  demoProviders,
  demoContributions,
  demoTranches,
} from '@/domain/seeds';
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

export class ObraFlowDB extends Dexie {
  projects!: Table<Project, string>;
  tranches!: Table<Tranche, string>;
  equityContributions!: Table<EquityContribution, string>;
  categories!: Table<Category, string>;
  budgetItems!: Table<BudgetItem, string>;
  providers!: Table<Provider, string>;
  expenses!: Table<Expense, string>;
  documents!: Table<ParsedDocument, string>;

  constructor() {
    super('obra-flow');
    this.version(1).stores({
      projects: 'id',
      tranches: 'id, projectId, status, plannedDate',
      categories: 'id, projectId, sortOrder',
      providers: 'id, projectId',
      expenses: 'id, projectId, categoryId, providerId, date',
      documents: 'id, projectId, status, kind',
    });
    this.version(2).stores({
      equityContributions: 'id, projectId, date',
    });
    this.version(3).stores({
      budgetItems: 'id, projectId, categoryId, date',
    });
  }
}

export const db = new ObraFlowDB();

let seedPromise: Promise<void> | null = null;

export function ensureSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const count = await db.projects.count();
      if (count > 0) return;
      await db.transaction(
        'rw',
        [db.projects, db.tranches, db.equityContributions, db.categories, db.providers, db.expenses, db.documents],
        async () => {
          await db.projects.add(demoProject());
          await db.tranches.bulkAdd(demoTranches());
          await db.equityContributions.bulkAdd(demoContributions());
          await db.categories.bulkAdd(demoCategories());
          await db.providers.bulkAdd(demoProviders());
          await db.expenses.bulkAdd(demoExpenses());
          await db.documents.bulkAdd(demoDocuments());
        },
      );
    })();
  }
  return seedPromise;
}
