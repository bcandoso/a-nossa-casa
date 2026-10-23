import { useMemo } from 'react';
import { summarizeBudget } from '@/domain/payment';
import { useFundingFlow } from './useFundingFlow';
import type { ProjectData } from './useProjectData';

export function useBudgetSummary(data: ProjectData) {
  const { categories, variance } = useFundingFlow(data);
  return useMemo(() => summarizeBudget(categories, variance), [categories, variance]);
}
