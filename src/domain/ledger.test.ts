import { describe, expect, it } from 'vitest';
import { buildLedger } from './ledger';
import type { Category, Expense, ParsedDocument } from './types';

const category = (id: string): Category => ({
  id,
  projectId: 'p',
  name: id,
  submittedBudget: 1_000,
  color: '',
  sortOrder: 0,
  complete: false,
});

const expense = (id: string, categoryId: string, date: string, documentId?: string): Expense => ({
  id,
  projectId: 'p',
  providerId: 'prov',
  categoryId,
  amount: 100,
  date,
  documentId,
});

const doc = (partial: Partial<ParsedDocument> & Pick<ParsedDocument, 'id' | 'kind' | 'status'>): ParsedDocument => ({
  projectId: 'p',
  fileName: `${partial.id}.pdf`,
  mimeType: 'application/pdf',
  extracted: { amount: 900, date: '2026-01-01' },
  uploadedAt: '2026-01-01T00:00:00Z',
  ...partial,
});

describe('buildLedger', () => {
  it('nests expenses under their category in date order and marks invoices', () => {
    const rows = buildLedger(
      [category('a'), category('b')],
      [],
      [expense('e2', 'a', '2026-03-01', 'd1'), expense('e1', 'a', '2026-02-01')],
      [doc({ id: 'd1', kind: 'invoice', status: 'validated', categoryId: 'a' })],
    );
    expect(rows[0]?.entries.map((entry) => [entry.kind, entry.expenseId, entry.fileName])).toEqual([
      ['expense', 'e1', undefined],
      ['invoice', 'e2', 'd1.pdf'],
    ]);
    expect(rows[1]?.entries).toEqual([]);
  });

  it('lists budget items with their attached file', () => {
    const rows = buildLedger(
      [category('a')],
      [],
      [],
      [doc({ id: 'q1', kind: 'budget', status: 'validated', categoryId: 'a' })],
      [
        { id: 'b1', projectId: 'p', categoryId: 'a', amount: 900, date: '2026-01-02', documentId: 'q1' },
        { id: 'b2', projectId: 'p', categoryId: 'a', amount: 300, date: '2026-01-01' },
      ],
    );
    expect(rows[0]?.entries.map((entry) => [entry.kind, entry.amount, entry.fileName, entry.budgetItemId])).toEqual([
      ['budget', 300, undefined, 'b2'],
      ['budget', 900, 'q1.pdf', 'b1'],
    ]);
  });
});
