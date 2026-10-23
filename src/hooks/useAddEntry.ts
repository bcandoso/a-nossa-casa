import { useMemo, useState } from 'react';
import { providersForCategory, resolveProvider } from '@/domain/providers';
import type { ExtractedFields, Id } from '@/domain/types';
import { pt } from '@/i18n/pt-PT';
import { hasAnyField } from '@/services/parsing/DocumentParser';
import { createDefaultParser } from '@/services/parsing/defaultParser';
import { removeDocument, saveBudgetItem, saveDocument, saveExpense } from '@/services/storage/repositories';
import type { ProjectData } from './useProjectData';

export type EntryKind = 'payment' | 'budget';

/** An existing payment or quote opened for editing. */
export interface EntryDraft {
  kind: EntryKind;
  id: Id;
  categoryId: Id;
  providerId?: Id;
  amount: number;
  date: string;
  documentId?: Id;
  fileName?: string;
}

const parser = createDefaultParser();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * State for adding or editing a payment or a budgeted cost. A file is optional;
 * when one is attached its extracted values fill whatever the user has not typed yet.
 */
export function useAddEntry(data: ProjectData, onSaved: () => void, draft?: EntryDraft) {
  const { project, categories, providers } = data;
  const [kind, setKind] = useState<EntryKind>(draft?.kind ?? 'payment');
  const [categoryId, setCategoryIdState] = useState<Id>(draft?.categoryId ?? categories[0]?.id ?? '');
  const [providerId, setProviderId] = useState<Id>(
    () => draft?.providerId ?? resolveProvider(providersForCategory(providers, categories[0]?.id ?? ''), ''),
  );
  const providerOptions = useMemo(() => providersForCategory(providers, categoryId), [providers, categoryId]);

  const setCategoryId = (next: Id) => {
    setCategoryIdState(next);
    setProviderId((current) => resolveProvider(providersForCategory(providers, next), current));
  };
  const [amount, setAmount] = useState(draft ? String(draft.amount) : '');
  const [date, setDate] = useState(draft?.date ?? today());
  const [file, setFile] = useState<File | null>(null);
  const [keptFileName, setKeptFileName] = useState<string | null>(draft?.fileName ?? null);
  const [extracted, setExtracted] = useState<ExtractedFields>({});
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');

  const attach = async (next: File | null) => {
    setFile(next);
    setKeptFileName(null);
    setExtracted({});
    setError('');
    if (!next) return;
    setReading(true);
    try {
      const fields = await parser.parse(next);
      if (!hasAnyField(fields)) {
        setError(pt.documents.nothingRead);
        return;
      }
      setExtracted(fields);
      if (!amount && fields.amount != null) setAmount(String(fields.amount));
      if (fields.date) setDate(fields.date);
      const provider = providers.find(
        (candidate) =>
          (fields.nif && candidate.nif === fields.nif) ||
          (fields.providerName && candidate.name.toLowerCase() === fields.providerName.toLowerCase()),
      );
      const category = fields.categoryHint
        ? categories.find((candidate) => candidate.name === fields.categoryHint)
        : undefined;
      if (category) setCategoryId(category.id);
      const options = providersForCategory(providers, category?.id ?? categoryId);
      if (provider && options.some((option) => option.id === provider.id)) setProviderId(provider.id);
    } catch {
      setError(pt.documents.parseFailed);
    } finally {
      setReading(false);
    }
  };

  const reset = () => {
    setAmount('');
    setDate(today());
    setFile(null);
    setKeptFileName(null);
    setExtracted({});
    setError('');
  };

  const value = Number(amount) || 0;
  const canSave = Boolean(project && categoryId && value > 0 && date && (kind === 'budget' || providerId));

  const save = async () => {
    if (!project || !canSave) return;
    let documentId = keptFileName ? draft?.documentId : undefined;
    if (draft?.documentId && documentId !== draft.documentId) await removeDocument(draft.documentId);
    if (file) {
      documentId = crypto.randomUUID();
      await saveDocument({
        id: documentId,
        projectId: project.id,
        providerId: providerId || undefined,
        categoryId,
        kind: kind === 'payment' ? 'invoice' : 'budget',
        fileName: file.name,
        mimeType: file.type,
        extracted: { ...extracted, amount: value, date },
        status: 'validated',
        uploadedAt: new Date().toISOString(),
      });
    }
    const id = draft?.id ?? crypto.randomUUID();
    if (kind === 'payment') {
      await saveExpense({ id, projectId: project.id, providerId, categoryId, amount: value, date, documentId });
    } else {
      await saveBudgetItem({
        id,
        projectId: project.id,
        categoryId,
        providerId: providerId || undefined,
        amount: value,
        date,
        documentId,
      });
    }
    reset();
    onSaved();
  };

  return {
    editing: Boolean(draft),
    kind,
    setKind,
    categoryId,
    setCategoryId,
    providerId,
    setProviderId,
    providerOptions,
    providerLocked: providerOptions.length === 1,
    amount,
    setAmount,
    date,
    setDate,
    file,
    fileName: file?.name ?? keptFileName,
    attach,
    reading,
    error,
    canSave,
    save,
  };
}
