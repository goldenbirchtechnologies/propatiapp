export { taxEngine } from './tax';
export { paymentProvider } from './payment';
export { verificationProvider } from './verification';
export { legalEngine } from './agreements';
export { documentRenderer } from './documents';
export { notifier } from './notifications';

export interface UKModule {
  code: string;
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  supportedCurrencies: string[];
}

export const ukModule: UKModule = {
  code: 'GB',
  name: 'United Kingdom',
  currency: 'GBP',
  locale: 'en-GB',
  timezone: 'Europe/London',
  supportedCurrencies: ['GBP'],
};
