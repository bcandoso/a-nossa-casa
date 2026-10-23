import type { Alert, Category, CategoryVariance, Project } from './types';

export function isEquityLow(equityTotal: number, equityRemaining: number, alertPct: number): boolean {
  return equityTotal > 0 && equityRemaining < equityTotal * (alertPct / 100);
}

export function computeAlerts(
  project: Project,
  categories: Category[],
  variance: CategoryVariance[],
  equityTotal: number,
  equityRemaining: number,
): Alert[] {
  const alerts: Alert[] = [];
  const byId = new Map(categories.map((category) => [category.id, category]));

  for (const row of variance) {
    if (row.state !== 'over') continue;
    const category = byId.get(row.categoryId);
    alerts.push({
      kind: 'category-over',
      categoryId: row.categoryId,
      categoryName: category?.name,
      amount: row.delta,
    });
  }

  if (isEquityLow(equityTotal, equityRemaining, project.equityAlertPct)) {
    alerts.push({
      kind: 'equity-low',
      amount: Math.max(0, equityRemaining),
      pct: project.equityAlertPct,
    });
  }

  return alerts;
}
