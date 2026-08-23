import type { DocumentRenderer } from '../../interfaces';

export const documentRenderer: DocumentRenderer = {
  async render(template, data) {
    const content = template.replace(/{{(\w+)}}/g, (_, key) => String(data[key] ?? ''));
    return Buffer.from(content, 'utf-8');
  },
  getSupportedFormats() {
    return ['pdf', 'html', 'txt'];
  },
  getDocumentType() {
    return 'tenancy_agreement_gh';
  },
};
