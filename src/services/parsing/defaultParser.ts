import type { ExtractedFields } from '@/domain/types';
import type { DocumentParser } from './DocumentParser';

/** PDF text first, then OCR for scans and photos. Returns no fields when nothing could be read. */
export function createDefaultParser(): DocumentParser {
  return {
    async parse(file: File): Promise<ExtractedFields> {
      const { CompositeDocumentParser } = await import('./DocumentParser');
      const { PdfTextParser } = await import('./pdfTextParser');
      const { OcrParser } = await import('./ocrParser');
      return new CompositeDocumentParser([new PdfTextParser(), new OcrParser()]).parse(file);
    },
  };
}
