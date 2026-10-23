import { useState } from 'react';
import type { Category, Id, Project } from '@/domain/types';
import { interpolate } from '@/i18n/format';
import { pt } from '@/i18n/pt-PT';
import { countCategoryEntries, removeCategory, saveCategory } from '@/services/storage/repositories';

const PALETTE = [
  'var(--flare-500)',
  'var(--flare-400)',
  'var(--blue-500)',
  'var(--surge-500)',
  'var(--yellow-500)',
  'var(--abyss-400)',
  'var(--green-500)',
  'var(--purple-500)',
];

export function useCategoryEditor(project: Project | null, categories: Category[]) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [editingId, setEditingId] = useState<Id | null>(null);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('');

  const add = async () => {
    if (!project || !name.trim()) return;
    await saveCategory({
      id: crypto.randomUUID(),
      projectId: project.id,
      name: name.trim(),
      submittedBudget: Number(budget) || 0,
      color: PALETTE[categories.length % PALETTE.length] ?? 'var(--flare-500)',
      sortOrder: categories.length + 1,
      complete: false,
    });
    setName('');
    setBudget('');
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditBudget(String(category.submittedBudget));
  };

  const saveEdit = async (category: Category) => {
    if (!editName.trim()) return;
    await saveCategory({ ...category, name: editName.trim(), submittedBudget: Number(editBudget) || 0 });
    setEditingId(null);
  };

  const toggleComplete = (category: Category, complete: boolean) => saveCategory({ ...category, complete });

  const remove = async (category: Category) => {
    const count = await countCategoryEntries(category.id);
    const message = count > 0
      ? interpolate(pt.settings.confirmRemoveCategoryEntries, { name: category.name, count: String(count) })
      : interpolate(pt.settings.confirmRemoveCategory, { name: category.name });
    if (!window.confirm(message)) return;
    await removeCategory(category.id);
  };

  return {
    name,
    setName,
    budget,
    setBudget,
    add,
    editingId,
    editName,
    setEditName,
    editBudget,
    setEditBudget,
    startEdit,
    cancelEdit: () => setEditingId(null),
    saveEdit,
    toggleComplete,
    remove,
  };
}
