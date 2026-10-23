import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import table from '@/components/ui/DataTable.module.css';
import { TextField } from '@/components/ui/TextField';
import type { Category, Project } from '@/domain/types';
import { useCategoryEditor } from '@/hooks/useCategoryEditor';
import { formatMoney } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import shared from '../shared.module.css';
import styles from './Settings.module.css';

export function CategoriesCard({ project, categories }: { project: Project; categories: Category[] }) {
  const editor = useCategoryEditor(project, categories);

  return (
    <Card title={pt.settings.categories} hint={pt.settings.categoriesHint}>
      <div className={shared.form}>
        <TextField id="cat-name" label={pt.settings.name} value={editor.name} onChange={(e) => editor.setName(e.target.value)} />
        <TextField id="cat-budget" label={pt.settings.submittedBudget} type="number" value={editor.budget} onChange={(e) => editor.setBudget(e.target.value)} />
        <Button onClick={() => void editor.add()} disabled={!editor.name.trim()}>
          {pt.settings.addCategory}
        </Button>
      </div>
      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th>{pt.settings.name}</th>
              <th className={table.numeric}>{pt.settings.submittedBudget}</th>
              <th>{pt.settings.complete}</th>
              <th>{pt.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) =>
              editor.editingId === category.id ? (
                <tr key={category.id} className={styles.editRow}>
                  <td colSpan={4} className={styles.editCell}>
                    <div className={shared.form}>
                      <TextField id={`cat-edit-name-${category.id}`} label={pt.settings.name} value={editor.editName} onChange={(e) => editor.setEditName(e.target.value)} />
                      <TextField
                        id={`cat-edit-budget-${category.id}`}
                        label={pt.settings.submittedBudget}
                        type="number"
                        value={editor.editBudget}
                        onChange={(e) => editor.setEditBudget(e.target.value)}
                      />
                      <div className={shared.actions}>
                        <Button size="sm" onClick={() => void editor.saveEdit(category)} disabled={!editor.editName.trim()}>
                          {pt.common.save}
                        </Button>
                        <Button size="sm" tone="ghost" onClick={editor.cancelEdit}>
                          {pt.common.cancel}
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={category.id}>
                  <td className={table.primary}>{category.name}</td>
                  <td className={[table.numeric, table.aside].join(' ')}>{formatMoney(category.submittedBudget)}</td>
                  <td data-label={pt.settings.complete}>
                    <label className={shared.check}>
                      <input
                        type="checkbox"
                        checked={category.complete}
                        onChange={(event) => void editor.toggleComplete(category, event.target.checked)}
                      />
                      {category.complete ? pt.common.yes : pt.common.no}
                    </label>
                  </td>
                  <td className={table.actionsCell}>
                    <RowActions onEdit={() => editor.startEdit(category)} onRemove={() => void editor.remove(category)} />
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function RowActions({ onEdit, onRemove }: { onEdit: () => void; onRemove: () => void }) {
  return (
    <span className={styles.rowActions}>
      <button type="button" className={styles.iconButton} onClick={onEdit} aria-label={pt.common.edit} title={pt.common.edit}>
        <Pencil size={14} />
      </button>
      <button
        type="button"
        className={[styles.iconButton, styles.danger].join(' ')}
        onClick={onRemove}
        aria-label={pt.funding.remove}
        title={pt.funding.remove}
      >
        <Trash2 size={14} />
      </button>
    </span>
  );
}
