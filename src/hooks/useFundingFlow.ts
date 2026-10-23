import { useMemo } from 'react';
import { computeAlerts } from '@/domain/alerts';
import { applyBudgetItems } from '@/domain/budget';
import { allocateExpenses, totalEquity } from '@/domain/cashflow';
import { buildFundingFlow } from '@/domain/sankey';
import { computeVariance, totalVariance } from '@/domain/variance';
import { pt } from '@/i18n/pt-PT';
import type { ProjectData } from './useProjectData';

export function useFundingFlow(data: ProjectData) {
  return useMemo(() => {
    const { project, tranches, contributions, budgetItems, providers, expenses } = data;
    const categories = applyBudgetItems(data.categories, budgetItems);
    if (!project) {
      return {
        cashflow: null,
        variance: [],
        graph: { nodes: [], links: [] },
        alerts: [],
        totalDelta: 0,
        releasedTotal: 0,
        equityTotal: 0,
        categories,
      };
    }

    const equityTotal = totalEquity(project.equityTotal, contributions);
    const cashflow = allocateExpenses(expenses, tranches, project.equityTotal, contributions);
    const variance = computeVariance(categories, expenses, project.inflatedVariancePct);
    const graph = buildFundingFlow({
      loanTotal: project.loanTotal,
      equityTotal,
      tranches,
      categories,
      providers,
      expenses,
      allocations: cashflow.allocations,
      labels: {
        equity: pt.sankey.equity,
        unreleased: pt.sankey.unreleased,
        available: pt.sankey.available,
      },
    });
    const alerts = computeAlerts(project, categories, variance, equityTotal, cashflow.equityRemaining);
    const releasedTotal = tranches
      .filter((tranche) => tranche.status === 'released')
      .reduce((sum, tranche) => sum + tranche.amount, 0);

    return {
      cashflow,
      variance,
      graph,
      alerts,
      totalDelta: totalVariance(variance),
      releasedTotal,
      equityTotal,
      categories,
    };
  }, [data]);
}
