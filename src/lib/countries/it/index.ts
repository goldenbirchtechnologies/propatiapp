export { taxEngine } from './tax';
export { paymentProvider } from './payment';
export { verificationProvider } from './verification';
export { legalEngine } from './agreements';
export { documentRenderer } from './documents';
export { notifier } from './notifications';

export interface ItalyModule {
  code: string;
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  supportedCurrencies: string[];
}

export const italyModule: ItalyModule = {
  code: 'IT',
  name: 'Italy',
  currency: 'EUR',
  locale: 'it-IT',
  timezone: 'Europe/Rome',
  supportedCurrencies: ['EUR'],
};
