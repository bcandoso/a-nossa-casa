import { useState } from 'react';
import type { Id, Project, Provider } from '@/domain/types';
import { interpolate } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import { countProviderPayments, removeProvider, saveProvider } from '@/services/storage/repositories';

export function useProviderEditor(project: Project | null) {
  const [name, setName] = useState('');
  const [nif, setNif] = useState('');
  const [editingId, setEditingId] = useState<Id | null>(null);
  const [editName, setEditName] = useState('');
  const [editNif, setEditNif] = useState('');

  const add = async () => {
    if (!project || !name.trim()) return;
    await saveProvider({ id: crypto.randomUUID(), projectId: project.id, name: name.trim(), nif: nif.trim(), categoryIds: [] });
    setName('');
    setNif('');
  };

  const startEdit = (provider: Provider) => {
    setEditingId(provider.id);
    setEditName(provider.name);
    setEditNif(provider.nif);
  };

  const saveEdit = async (provider: Provider) => {
    if (!editName.trim()) return;
    await saveProvider({ ...provider, name: editName.trim(), nif: editNif.trim() });
    setEditingId(null);
  };

  const toggleCategory = (provider: Provider, categoryId: Id) => {
    const linked = provider.categoryIds.includes(categoryId);
    return saveProvider({
      ...provider,
      categoryIds: linked
        ? provider.categoryIds.filter((id) => id !== categoryId)
        : [...provider.categoryIds, categoryId],
    });
  };

  const remove = async (provider: Provider) => {
    const count = await countProviderPayments(provider.id);
    if (count > 0 && !window.confirm(interpolate(pt.settings.confirmRemoveProvider, { name: provider.name, count: String(count) }))) {
      return;
    }
    await removeProvider(provider.id);
  };

  return {
    name,
    setName,
    nif,
    setNif,
    add,
    editingId,
    editName,
    setEditName,
    editNif,
    setEditNif,
    startEdit,
    cancelEdit: () => setEditingId(null),
    saveEdit,
    toggleCategory,
    remove,
  };
}
