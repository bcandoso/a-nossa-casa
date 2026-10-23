import type { ExtractedFields } from '@/domain/types';
import type { DocumentParser } from './DocumentParser';
import { extractInvoiceFields } from './invoiceFieldExtractor';

export class PdfTextParser implements DocumentParser {
  async parse(file: File): Promise<ExtractedFields> {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return {};
    }

    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();

    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data }).promise;
    const pages: string[] = [];
    const max = Math.min(pdf.numPages, 4);
    for (let pageNumber = 1; pageNumber <= max; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
    }
    return extractInvoiceFields(pages.join('\n'));
  }
}
