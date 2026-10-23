import { Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Segmented } from '@/components/ui/Segmented';
import { SelectField, TextField } from '@/components/ui/TextField';
import { useAddEntry, type EntryDraft, type EntryKind } from '@/hooks/useAddEntry';
import type { ProjectData } from '@/hooks/useProjectData';
import { pt } from '@/i18n/pt-PT';
import shared from '../shared.module.css';
import styles from './AddEntryForm.module.css';

export function AddEntryForm({
  data,
  onClose,
  draft,
}: {
  data: ProjectData;
  onClose: () => void;
  draft?: EntryDraft;
}) {
  const entry = useAddEntry(data, onClose, draft);
  const isPayment = entry.kind === 'payment';
  const saveLabel = entry.editing ? pt.budget.saveChanges : isPayment ? pt.budget.savePayment : pt.budget.saveBudget;
  const idPrefix = draft ? `edit-${draft.id}` : 'entry';

  return (
    <div className={styles.panel}>
      {entry.editing ? null : (
        <Segmented
          label={pt.budget.entryKind}
          value={entry.kind}
          options={[
            { id: 'payment', label: pt.budget.kindPayment },
            { id: 'budget', label: pt.budget.kindBudget },
          ]}
          onChange={(id) => entry.setKind(id as EntryKind)}
        />
      )}

      <div className={shared.form}>
        <SelectField id={`${idPrefix}-cat`} label={pt.table.category} value={entry.categoryId} onChange={(e) => entry.setCategoryId(e.target.value)}>
          {data.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          id={`${idPrefix}-provider`}
          label={isPayment ? pt.table.provider : pt.budget.providerOptional}
          value={entry.providerId}
          onChange={(e) => entry.setProviderId(e.target.value)}
          disabled={entry.providerLocked}
        >
          {entry.providerLocked ? null : <option value="">{pt.budget.chooseProvider}</option>}
          {entry.providerOptions.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </SelectField>
        <TextField id={`${idPrefix}-amount`} label={pt.table.amount} type="number" value={entry.amount} onChange={(e) => entry.setAmount(e.target.value)} />
        <DateField id={`${idPrefix}-date`} label={pt.table.date} value={entry.date} onChange={entry.setDate} />
      </div>

      <div className={styles.attach}>
        {entry.fileName ? (
          <span className={styles.fileChip}>
            <Paperclip size={14} aria-hidden />
            <span className={styles.fileName}>{entry.fileName}</span>
            <button type="button" className={styles.clear} onClick={() => void entry.attach(null)} aria-label={pt.budget.removeFile}>
              <X size={14} />
            </button>
          </span>
        ) : (
          <label className={styles.attachButton}>
            <Paperclip size={14} aria-hidden />
            {isPayment ? pt.budget.attachInvoice : pt.budget.attachQuote}
            <input
              type="file"
              className={styles.hiddenInput}
              accept="application/pdf,image/png,image/jpeg"
              onChange={(event) => void entry.attach(event.target.files?.[0] ?? null)}
            />
          </label>
        )}
        <span className={styles.hint}>{entry.reading ? pt.documents.parsing : entry.error || pt.budget.attachHint}</span>
      </div>

      <div className={shared.actions}>
        <Button onClick={() => void entry.save()} disabled={!entry.canSave || entry.reading}>
          {saveLabel}
        </Button>
        <Button tone="ghost" onClick={onClose}>
          {pt.common.cancel}
        </Button>
      </div>
    </div>
  );
}
