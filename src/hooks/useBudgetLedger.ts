import { useCallback, useMemo, useState } from 'react';
import { primarySource } from '@/domain/cashflow';
import { buildLedger } from '@/domain/ledger';
import { summarizeBudget, type PaymentState } from '@/domain/payment';
import type { Id } from '@/domain/types';
import { pt } from '@/i18n/pt-PT';
import { useFundingFlow } from './useFundingFlow';
import type { ProjectData } from './useProjectData';

export function useBudgetLedger(data: ProjectData) {
  const { cashflow, variance, categories } = useFundingFlow(data);
  const summary = useMemo(() => summarizeBudget(categories, variance), [categories, variance]);
  const [expanded, setExpanded] = useState<ReadonlySet<Id>>(() => new Set());

  const rows = useMemo(
    () => buildLedger(categories, variance, data.expenses, data.documents, data.budgetItems),
    [categories, variance, data.expenses, data.documents, data.budgetItems],
  );

  const providerName = useMemo(
    () => new Map(data.providers.map((provider) => [provider.id, provider.name])),
    [data.providers],
  );

  const sourceLabel = useMemo(() => {
    const trancheLabel = new Map(data.tranches.map((tranche) => [tranche.id, tranche.label]));
    const allocationById = new Map((cashflow?.allocations ?? []).map((row) => [row.expenseId, row]));
    return (expenseId: Id): string => {
      const source = primarySource(allocationById.get(expenseId));
      if (!source) return '—';
      if (source.type === 'equity') return pt.source.equity;
      return trancheLabel.get(source.trancheId ?? '') ?? pt.source.tranche;
    };
  }, [cashflow, data.tranches]);

  const toggle = useCallback((categoryId: Id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }, []);

  const stateOf = useCallback(
    (categoryId: Id): PaymentState => summary.stateById.get(categoryId) ?? 'unpaid',
    [summary],
  );

  const [editingId, setEditingId] = useState<string | null>(null);

  return { rows, expanded, toggle, providerName, sourceLabel, stateOf, editingId, setEditingId };
}
