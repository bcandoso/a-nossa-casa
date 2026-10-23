import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { ensureSeed } from '@/services/storage/db';
import { loadWorkspace } from '@/services/storage/repositories';
import type { BudgetItem, Category, EquityContribution, Expense, ParsedDocument, Project, Provider, Tranche } from '@/domain/types';

export interface ProjectData {
  project: Project | null;
  tranches: Tranche[];
  contributions: EquityContribution[];
  categories: Category[];
  budgetItems: BudgetItem[];
  providers: Provider[];
  expenses: Expense[];
  documents: ParsedDocument[];
  ready: boolean;
}

const EMPTY: Omit<ProjectData, 'ready'> = {
  project: null,
  tranches: [],
  contributions: [],
  categories: [],
  budgetItems: [],
  providers: [],
  expenses: [],
  documents: [],
};

export function useProjectData(): ProjectData {
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    void ensureSeed().then(() => setSeeded(true));
  }, []);

  const data = useLiveQuery(
    async () => {
      if (!seeded) return undefined;
      return loadWorkspace();
    },
    [seeded],
  );

  return {
    ...(data ?? EMPTY),
    ready: seeded && data !== undefined,
  };
}
