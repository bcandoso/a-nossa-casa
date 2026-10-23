import type { ExtractedFields } from '@/domain/types';

const NIF = /\b(\d{9})\b/;
const INVOICE = /\b(?:FT|Factura|Fatura)\s*[:.]?\s*(\d+\s*\/\s*\d+)\b/i;
const DATE = /\b(\d{2}[./-]\d{2}[./-]\d{4})\b/;
const AMOUNT = /(?:EUR|€)\s*(\d{1,3}(?:[.\s]\d{3})*[.,]\d{2})|(\d{1,3}(?:[.\s]\d{3})*[.,]\d{2})\s*€/;

function toIsoDate(raw: string): string | undefined {
  const parts = raw.split(/[./-]/).map(Number);
  if (parts.length !== 3) return undefined;
  const [day, month, year] = parts;
  if (!day || !month || !year) return undefined;
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return Number.isNaN(Date.parse(`${iso}T00:00:00`)) ? undefined : iso;
}

function toAmount(raw: string): number | undefined {
  const normalised = raw.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const value = Number(normalised);
  return Number.isFinite(value) ? value : undefined;
}

export function extractInvoiceFields(text: string): ExtractedFields {
  const nif = text.match(NIF)?.[1];
  const invoiceNumber = text.match(INVOICE)?.[1]?.replace(/\s+/g, '');
  const date = text.match(DATE)?.[1];
  const amountMatch = text.match(AMOUNT);
  const amountRaw = amountMatch?.[1] ?? amountMatch?.[2];
  return {
    nif,
    invoiceNumber: invoiceNumber ? `FT ${invoiceNumber}` : undefined,
    date: date ? toIsoDate(date) : undefined,
    amount: amountRaw ? toAmount(amountRaw) : undefined,
  };
}
