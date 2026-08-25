export { taxEngine } from './tax';
export { paymentProvider } from './payment';
export { verificationProvider } from './verification';
export { legalEngine } from './agreements';
export { documentRenderer } from './documents';
export { notifier } from './notifications';

export interface BeninModule {
  code: string;
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  supportedCurrencies: string[];
}

export const beninModule: BeninModule = {
  code: 'BJ',
  name: 'Benin',
  currency: 'XOF',
  locale: 'fr-BJ',
  timezone: 'Africa/Porto-Novo',
  supportedCurrencies: ['XOF'],
};
