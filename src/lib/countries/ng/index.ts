export { taxEngine } from './tax';
export { paymentProvider } from './payment';
export { verificationProvider } from './verification';
export { legalEngine } from './agreements';
export { documentRenderer } from './documents';
export { notifier } from './notifications';

export interface NigeriaModule {
  code: string;
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  supportedCurrencies: string[];
}

export const nigeriaModule: NigeriaModule = {
  code: 'NG',
  name: 'Nigeria',
  currency: 'NGN',
  locale: 'en-NG',
  timezone: 'Africa/Lagos',
  supportedCurrencies: ['NGN'],
};
