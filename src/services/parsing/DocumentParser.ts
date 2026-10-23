import type { ExtractedFields } from '@/domain/types';

export interface DocumentParser {
  parse(file: File): Promise<ExtractedFields>;
}

export class CompositeDocumentParser implements DocumentParser {
  constructor(private readonly parsers: DocumentParser[]) {}

  async parse(file: File): Promise<ExtractedFields> {
    for (const parser of this.parsers) {
      try {
        const extracted = await parser.parse(file);
        if (hasAnyField(extracted)) return extracted;
      } catch {
        // Try the next parser.
      }
    }
    return {};
  }
}

export function hasAnyField(fields: ExtractedFields): boolean {
  return Object.values(fields).some((value) => value !== undefined && value !== '');
}
