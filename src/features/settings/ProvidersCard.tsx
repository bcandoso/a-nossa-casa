import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import table from '@/components/ui/DataTable.module.css';
import { TextField } from '@/components/ui/TextField';
import type { Category, Project, Provider } from '@/domain/types';
import { useProviderEditor } from '@/hooks/useProviderEditor';
import { pt } from '@/i18n/pt-PT';
import shared from '../shared.module.css';
import { RowActions } from './CategoriesCard';
import styles from './Settings.module.css';

export function ProvidersCard({
  project,
  providers,
  categories,
}: {
  project: Project;
  providers: Provider[];
  categories: Category[];
}) {
  const editor = useProviderEditor(project);

  return (
    <Card title={pt.settings.providers} hint={pt.settings.linkedHint}>
      <div className={shared.form}>
        <TextField id="prov-name" label={pt.settings.name} value={editor.name} onChange={(e) => editor.setName(e.target.value)} />
        <TextField id="prov-nif" label={pt.documents.nif} value={editor.nif} onChange={(e) => editor.setNif(e.target.value)} />
        <Button onClick={() => void editor.add()} disabled={!editor.name.trim()}>
          {pt.settings.addProvider}
        </Button>
      </div>
      <div className={table.wrap}>
        <table className={table.table}>
          <thead>
            <tr>
              <th>{pt.settings.name}</th>
              <th>{pt.documents.nif}</th>
              <th>{pt.settings.linkedCategories}</th>
              <th>{pt.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) =>
              editor.editingId === provider.id ? (
                <tr key={provider.id} className={styles.editRow}>
                  <td colSpan={4} className={styles.editCell}>
                    <div className={shared.form}>
                      <TextField id={`prov-edit-name-${provider.id}`} label={pt.settings.name} value={editor.editName} onChange={(e) => editor.setEditName(e.target.value)} />
                      <TextField id={`prov-edit-nif-${provider.id}`} label={pt.documents.nif} value={editor.editNif} onChange={(e) => editor.setEditNif(e.target.value)} />
                      <div className={shared.actions}>
                        <Button size="sm" onClick={() => void editor.saveEdit(provider)} disabled={!editor.editName.trim()}>
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
                <tr key={provider.id}>
                  <td className={table.primary}>{provider.name}</td>
                  <td className={[table.numeric, table.aside].join(' ')}>{provider.nif}</td>
                  <td className={styles.chipsCell}>
                    <span className={styles.chips} role="group" aria-label={pt.settings.linkedCategories}>
                      {categories.map((category) => {
                        const linked = provider.categoryIds.includes(category.id);
                        return (
                          <button
                            key={category.id}
                            type="button"
                            className={linked ? styles.chipOn : styles.chip}
                            aria-pressed={linked}
                            onClick={() => void editor.toggleCategory(provider, category.id)}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </span>
                  </td>
                  <td className={table.actionsCell}>
                    <RowActions onEdit={() => editor.startEdit(provider)} onRemove={() => void editor.remove(provider)} />
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
