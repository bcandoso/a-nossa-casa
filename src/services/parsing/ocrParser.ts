import type { ExtractedFields } from '@/domain/types';
import type { DocumentParser } from './DocumentParser';
import { extractInvoiceFields } from './invoiceFieldExtractor';

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export class OcrParser implements DocumentParser {
  async parse(file: File): Promise<ExtractedFields> {
    if (!IMAGE_TYPES.has(file.type)) return {};
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('por');
    try {
      const result = await worker.recognize(file);
      return extractInvoiceFields(result.data.text);
    } finally {
      await worker.terminate();
    }
  }
}
