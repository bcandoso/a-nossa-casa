import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import table from '@/components/ui/DataTable.module.css';
import { buildExtract } from '@/domain/cashflow';
import type { Category, EquityContribution, Expense, ExtractKind, Provider, Tranche } from '@/domain/types';
import { formatDate, formatMoney, formatMoneySigned } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import styles from './StatementCard.module.css';

export function StatementCard({
  expenses,
  tranches,
  openingEquity,
  contributions,
  categories,
  providers,
}: {
  expenses: Expense[];
  tranches: Tranche[];
  openingEquity: number;
  contributions: EquityContribution[];
  categories: Category[];
  providers: Provider[];
}) {
  const categoryName = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const providerName = useMemo(
    () => new Map(providers.map((provider) => [provider.id, provider.name])),
    [providers],
  );
  const trancheLabel = useMemo(
    () => new Map(tranches.map((tranche) => [tranche.id, tranche.label])),
    [tranches],
  );
  const expenseById = useMemo(
    () => new Map(expenses.map((expense) => [expense.id, expense])),
    [expenses],
  );
  const contributionLabel = useMemo(
    () => new Map(contributions.map((contribution) => [contribution.id, contribution.label])),
    [contributions],
  );
  const lines = useMemo(
    () => buildExtract(expenses, tranches, openingEquity, contributions),
    [expenses, tranches, openingEquity, contributions],
  );

  return (
    <Card title={pt.dashboard.extract} hint={pt.dashboard.extractHint}>
      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th>{pt.table.date}</th>
              <th>{pt.table.movement}</th>
              <th className={table.numeric}>{pt.table.amount}</th>
              <th className={table.numeric}>{pt.table.balance}</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={4} className={table.muted}>
                  {pt.common.empty}
                </td>
              </tr>
            ) : (
              lines.map((line) => {
                const credit = line.amount > 0;
                const debit = line.amount < 0;
                return (
                  <tr key={line.id}>
                    <td className={[styles.date, table.subStart].join(' ')}>{line.date ? formatDate(line.date) : '—'}</td>
                    <td className={table.primary}>{describeLine(line.kind, line.sourceId, { categoryName, providerName, trancheLabel, contributionLabel, expenseById })}</td>
                    <td
                      className={[
                        table.numeric,
                        table.aside,
                        credit ? table.positive : '',
                        debit ? table.negative : '',
                      ].join(' ')}
                    >
                      {formatMoneySigned(line.amount)}
                    </td>
                    <td className={[table.numeric, styles.balance, table.subEnd].join(' ')} data-label={pt.table.balance}>{formatMoney(line.balance)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface Lookups {
  categoryName: Map<string, string>;
  providerName: Map<string, string>;
  trancheLabel: Map<string, string>;
  contributionLabel: Map<string, string>;
  expenseById: Map<string, Expense>;
}

function describeLine(
  kind: ExtractKind,
  sourceId: string | undefined,
  { categoryName, providerName, trancheLabel, contributionLabel, expenseById }: Lookups,
): string {
  if (kind === 'opening') return pt.dashboard.opening;
  if (kind === 'contribution') return contributionLabel.get(sourceId ?? '') || pt.funding.contributionDefault;
  if (kind === 'release') return trancheLabel.get(sourceId ?? '') ?? pt.funding.released;
  const expense = sourceId ? expenseById.get(sourceId) : undefined;
  if (!expense) return pt.table.expenses;
  const provider = providerName.get(expense.providerId);
  const category = categoryName.get(expense.categoryId);
  if (provider && category) return `${provider} · ${category}`;
  return provider ?? category ?? pt.table.expenses;
}
