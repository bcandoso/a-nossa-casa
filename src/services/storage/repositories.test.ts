import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { applyBudgetItems } from '@/domain/budget';
import { allocateExpenses, totalEquity } from '@/domain/cashflow';
import { buildLedger } from '@/domain/ledger';
import { summarizeBudget } from '@/domain/payment';
import { providersForCategory } from '@/domain/providers';
import { computeVariance } from '@/domain/variance';
import {
  countCategoryEntries,
  countProviderPayments,
  loadWorkspace,
  removeBudgetItem,
  removeCategory,
  removeContribution,
  removeExpense,
  removeProvider,
  saveBudgetItem,
  saveCategory,
  saveContribution,
  saveDocument,
  saveExpense,
  saveProvider,
} from './repositories';

const CATEGORY = 'test-category';
const PROVIDER = 'test-provider';

async function workspace() {
  const data = await loadWorkspace();
  if (!data.project) throw new Error('no project');
  return { ...data, project: data.project };
}

describe('storage round trip', () => {
  it('seeds a demo project on first load', async () => {
    const data = await workspace();
    expect(data.categories.length).toBeGreaterThan(0);
    expect(data.providers.length).toBeGreaterThan(0);
    expect(data.expenses.length).toBeGreaterThan(0);
  });

  it('adds a category and a provider linked to it', async () => {
    const { project, categories } = await workspace();
    await saveCategory({
      id: CATEGORY,
      projectId: project.id,
      name: 'Serralharia',
      submittedBudget: 10_000,
      color: 'var(--blue-500)',
      sortOrder: categories.length + 1,
      complete: false,
    });
    await saveProvider({ id: PROVIDER, projectId: project.id, name: 'Ferros Lda', nif: '501234567', categoryIds: [CATEGORY] });

    const data = await workspace();
    expect(data.categories.at(-1)?.name).toBe('Serralharia');
    expect(providersForCategory(data.providers, CATEGORY).map((p) => p.id)).toEqual([PROVIDER]);
  });

  it('records payments and quotes, with and without files, and reads them back in the ledger', async () => {
    const { project } = await workspace();
    await saveDocument({
      id: 'doc-invoice',
      projectId: project.id,
      providerId: PROVIDER,
      categoryId: CATEGORY,
      kind: 'invoice',
      fileName: 'factura.pdf',
      mimeType: 'application/pdf',
      extracted: { amount: 4_000, date: '2026-10-01' },
      status: 'validated',
      uploadedAt: '2026-10-01T10:00:00.000Z',
    });
    await saveDocument({
      id: 'doc-quote',
      projectId: project.id,
      providerId: PROVIDER,
      categoryId: CATEGORY,
      kind: 'budget',
      fileName: 'orcamento.pdf',
      mimeType: 'application/pdf',
      extracted: { amount: 1_500, date: '2026-09-20' },
      status: 'validated',
      uploadedAt: '2026-09-20T10:00:00.000Z',
    });
    await saveExpense({ id: 'pay-invoice', projectId: project.id, providerId: PROVIDER, categoryId: CATEGORY, amount: 4_000, date: '2026-10-01', documentId: 'doc-invoice' });
    await saveExpense({ id: 'pay-manual', projectId: project.id, providerId: PROVIDER, categoryId: CATEGORY, amount: 500, date: '2026-10-05' });
    await saveBudgetItem({ id: 'quote-file', projectId: project.id, categoryId: CATEGORY, providerId: PROVIDER, amount: 1_500, date: '2026-09-20', documentId: 'doc-quote' });
    await saveBudgetItem({ id: 'quote-manual', projectId: project.id, categoryId: CATEGORY, amount: 250, date: '2026-09-25' });

    const data = await workspace();
    const categories = applyBudgetItems(data.categories, data.budgetItems);
    const category = categories.find((c) => c.id === CATEGORY);
    expect(category?.submittedBudget).toBe(11_750);

    const variance = computeVariance(categories, data.expenses, data.project.inflatedVariancePct);
    expect(variance.find((v) => v.categoryId === CATEGORY)?.realCost).toBe(4_500);

    const row = buildLedger(categories, variance, data.expenses, data.documents, data.budgetItems).find(
      (r) => r.category.id === CATEGORY,
    );
    expect(row?.entries.map((e) => [e.kind, e.amount, e.fileName])).toEqual([
      ['budget', 1_500, 'orcamento.pdf'],
      ['budget', 250, undefined],
      ['invoice', 4_000, 'factura.pdf'],
      ['expense', 500, undefined],
    ]);

    expect(summarizeBudget(categories, variance).stateById.get(CATEGORY)).toBe('partial');
    const cashflow = allocateExpenses(data.expenses, data.tranches, data.project.equityTotal, data.contributions);
    expect(cashflow.allocations.some((a) => a.expenseId === 'pay-manual')).toBe(true);
  });

  it('adds and removes an equity contribution', async () => {
    const before = await workspace();
    const opening = totalEquity(before.project.equityTotal, before.contributions);
    await saveContribution({ id: 'contrib', projectId: before.project.id, label: 'Reforço', amount: 2_000, date: '2026-10-10' });
    const after = await workspace();
    expect(totalEquity(after.project.equityTotal, after.contributions)).toBe(opening + 2_000);
    await removeContribution('contrib');
    expect((await workspace()).contributions.some((c) => c.id === 'contrib')).toBe(false);
  });

  it('removes entries, providers and categories', async () => {
    await removeExpense('pay-manual');
    await removeBudgetItem('quote-manual');
    let data = await workspace();
    expect(data.expenses.some((e) => e.id === 'pay-manual')).toBe(false);
    expect(data.budgetItems.some((b) => b.id === 'quote-manual')).toBe(false);

    expect(await countProviderPayments(PROVIDER)).toBe(1);
    await removeProvider(PROVIDER);
    expect(await countCategoryEntries(CATEGORY)).toBe(2);
    await removeCategory(CATEGORY);
    data = await workspace();
    expect(data.providers.some((p) => p.id === PROVIDER)).toBe(false);
    expect(data.categories.some((c) => c.id === CATEGORY)).toBe(false);
  });

  it('deleting a category also deletes its entries and files, so totals stay consistent', async () => {
    const data = await workspace();
    expect(data.expenses.some((e) => e.categoryId === CATEGORY)).toBe(false);
    expect(data.budgetItems.some((b) => b.categoryId === CATEGORY)).toBe(false);
    expect(data.documents.some((d) => d.id === 'doc-invoice' || d.id === 'doc-quote')).toBe(false);
  });

  it('deleting a payment also deletes its file and unlinks removed categories from providers', async () => {
    const { project, categories } = await workspace();
    const target = categories[0];
    if (!target) throw new Error('no category');
    await saveProvider({ id: 'p2', projectId: project.id, name: 'Outro', nif: '', categoryIds: [target.id, 'gone'] });
    await saveDocument({
      id: 'doc-x',
      projectId: project.id,
      kind: 'invoice',
      fileName: 'x.pdf',
      mimeType: 'application/pdf',
      extracted: {},
      status: 'validated',
      uploadedAt: '2026-10-01T10:00:00.000Z',
    });
    await saveExpense({ id: 'pay-x', projectId: project.id, providerId: 'p2', categoryId: target.id, amount: 10, date: '2026-10-01', documentId: 'doc-x' });
    await removeExpense('pay-x');
    expect((await workspace()).documents.some((d) => d.id === 'doc-x')).toBe(false);

    await saveCategory({ ...target, id: 'gone', name: 'Temporária' });
    await removeCategory('gone');
    expect((await workspace()).providers.find((p) => p.id === 'p2')?.categoryIds).toEqual([target.id]);
  });
});
