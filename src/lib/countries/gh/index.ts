export { taxEngine } from './tax';
export { paymentProvider } from './payment';
export { verificationProvider } from './verification';
export { legalEngine } from './agreements';
export { documentRenderer } from './documents';
export { notifier } from './notifications';

export interface GhanaModule {
  code: string;
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  supportedCurrencies: string[];
}

export const ghanaModule: GhanaModule = {
  code: 'GH',
  name: 'Ghana',
  currency: 'GHS',
  locale: 'en-GH',
  timezone: 'Africa/Accra',
  supportedCurrencies: ['GHS'],
};
