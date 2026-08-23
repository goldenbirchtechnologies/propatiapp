export interface DocumentRenderer {
  render(template: string, data: Record<string, unknown>): Promise<Buffer>;
  getSupportedFormats(): string[];
  getDocumentType(): string;
}
