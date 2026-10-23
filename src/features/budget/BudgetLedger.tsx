import { Fragment } from 'react';
import { ChevronRight, FileText, Pencil, PenLine, Trash2 } from 'lucide-react';
import { PaymentBadge } from '@/components/dashboard/PaymentBadge';
import table from '@/components/ui/DataTable.module.css';
import { Trend } from '@/components/ui/Trend';
import type { LedgerEntry } from '@/domain/ledger';
import type { Id } from '@/domain/types';
import type { EntryDraft } from '@/hooks/useAddEntry';
import type { ProjectData } from '@/hooks/useProjectData';
import { useBudgetLedger } from '@/hooks/useBudgetLedger';
import { formatDate, formatMoney } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import { removeBudgetItem, removeExpense } from '@/services/storage/repositories';
import { AddEntryForm } from './AddEntryForm';
import styles from './BudgetLedger.module.css';

export function BudgetLedger({ data }: { data: ProjectData }) {
  const { rows, expanded, toggle, providerName, sourceLabel, stateOf, editingId, setEditingId } = useBudgetLedger(data);

  return (
    <div className={table.wrap}>
      <table className={[table.table, styles.ledger].join(' ')}>
        <thead>
          <tr>
            <th>{pt.table.category}</th>
            <th className={table.numeric}>{pt.table.submitted}</th>
            <th className={table.numeric}>{pt.table.real}</th>
            <th className={table.numeric}>{pt.table.delta}</th>
            <th>{pt.table.state}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ category, variance, entries }) => {
            const open = expanded.has(category.id);
            const hasEntries = entries.length > 0;
            return (
              <Fragment key={category.id}>
                <tr className={open ? styles.rowOpen : undefined}>
                  <td className={table.primary}>
                    {hasEntries ? (
                      <button
                        type="button"
                        className={styles.toggle}
                        onClick={() => toggle(category.id)}
                        aria-expanded={open}
                      >
                        <ChevronRight size={14} className={open ? styles.chevronOpen : styles.chevron} aria-hidden />
                        <span>{category.name}</span>
                        <span className={styles.count}>{entries.length}</span>
                      </button>
                    ) : (
                      <span className={styles.flat}>{category.name}</span>
                    )}
                  </td>
                  <td className={table.numeric} data-label={pt.table.submitted}>
                    {formatMoney(category.submittedBudget)}
                  </td>
                  <td className={table.numeric} data-label={pt.table.real}>
                    {formatMoney(variance?.realCost ?? 0)}
                  </td>
                  <td className={table.numeric} data-label={pt.table.delta}>
                    <Trend delta={variance?.delta ?? 0} pct={variance?.deltaPct ?? 0} />
                  </td>
                  <td className={table.aside}>
                    <PaymentBadge state={stateOf(category.id)} />
                  </td>
                </tr>
                {open
                  ? entries.map((entry) =>
                      editingId === entry.id ? (
                        <tr key={entry.id} className={styles.editRow}>
                          <td colSpan={5} className={styles.editCell}>
                            <AddEntryForm
                              data={data}
                              draft={toDraft(entry, category.id)}
                              onClose={() => setEditingId(null)}
                            />
                          </td>
                        </tr>
                      ) : (
                        <EntryRow
                          key={entry.id}
                          entry={entry}
                          provider={entry.providerId ? providerName.get(entry.providerId) : undefined}
                          source={entry.expenseId ? sourceLabel(entry.expenseId) : undefined}
                          onEdit={() => setEditingId(entry.id)}
                        />
                      ),
                    )
                  : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const KIND_LABEL: Record<LedgerEntry['kind'], string> = {
  budget: pt.documents.kindBudget,
  invoice: pt.documents.kindInvoice,
  expense: pt.budget.manualExpense,
};

function toDraft(entry: LedgerEntry, categoryId: Id): EntryDraft {
  return {
    kind: entry.kind === 'budget' ? 'budget' : 'payment',
    id: entry.expenseId ?? entry.budgetItemId ?? entry.id,
    categoryId,
    providerId: entry.providerId,
    amount: entry.amount,
    date: entry.date,
    documentId: entry.documentId,
    fileName: entry.fileName,
  };
}

function removeEntry(entry: LedgerEntry): Promise<void> {
  if (entry.expenseId) return removeExpense(entry.expenseId);
  if (entry.budgetItemId) return removeBudgetItem(entry.budgetItemId);
  return Promise.resolve();
}

function EntryRow({
  entry,
  provider,
  source,
  onEdit,
}: {
  entry: LedgerEntry;
  provider: string | undefined;
  source: string | undefined;
  onEdit: () => void;
}) {
  const Icon = entry.fileName ? FileText : PenLine;
  const amount = formatMoney(entry.amount);
  return (
    <tr className={styles.entry}>
      <td className={table.primary}>
        <span className={styles.entryMain}>
          <Icon size={14} className={styles.entryIcon} aria-hidden />
          <span className={styles.entryText}>
            <span className={styles.entryTitle}>
              {KIND_LABEL[entry.kind]}
              {provider ? ` · ${provider}` : ''}
            </span>
            <span className={styles.entryMeta}>
              {formatDate(entry.date)}
              {entry.fileName ? ` · ${entry.fileName}` : ''}
            </span>
          </span>
        </span>
      </td>
      <td className={[table.numeric, entry.kind === 'budget' ? table.aside : styles.phoneHidden].join(' ')}>
        {entry.kind === 'budget' ? amount : ''}
      </td>
      <td className={[table.numeric, entry.kind === 'budget' ? styles.phoneHidden : table.aside].join(' ')}>
        {entry.kind === 'budget' ? '' : amount}
      </td>
      <td className={source ? styles.source : styles.phoneHidden} data-label={pt.table.source}>
        {source ?? ''}
      </td>
      <td className={styles.entryActions}>
        <span className={styles.entryButtons}>
          <button type="button" className={styles.iconButton} onClick={onEdit} aria-label={pt.common.edit} title={pt.common.edit}>
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className={[styles.iconButton, styles.remove].join(' ')}
            onClick={() => void removeEntry(entry)}
            aria-label={pt.funding.remove}
            title={pt.funding.remove}
          >
            <Trash2 size={14} />
          </button>
        </span>
      </td>
    </tr>
  );
}
