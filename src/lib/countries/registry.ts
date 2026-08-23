import type { PaymentProvider, TaxEngine, VerificationProvider, LegalEngine, DocumentRenderer, Notifier } from '../interfaces';
import { nigeriaModule, taxEngine as ngTax, paymentProvider as ngPay, verificationProvider as ngVer, legalEngine as ngLeg, documentRenderer as ngDoc, notifier as ngNot } from './ng';
import { ghanaModule, taxEngine as ghTax, paymentProvider as ghPay, verificationProvider as ghVer, legalEngine as ghLeg, documentRenderer as ghDoc, notifier as ghNot } from './gh';
import { beninModule, taxEngine as bjTax, paymentProvider as bjPay, verificationProvider as bjVer, legalEngine as bjLeg, documentRenderer as bjDoc, notifier as bjNot } from './bj';
import { ukModule, taxEngine as gbTax, paymentProvider as gbPay, verificationProvider as gbVer, legalEngine as gbLeg, documentRenderer as gbDoc, notifier as gbNot } from './gb';
import { italyModule, taxEngine as itTax, paymentProvider as itPay, verificationProvider as itVer, legalEngine as itLeg, documentRenderer as itDoc, notifier as itNot } from './it';

export interface CountryModule {
  code: string;
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  supportedCurrencies: string[];
  payment: PaymentProvider;
  tax: TaxEngine;
  verification: VerificationProvider;
  legal: LegalEngine;
  documents: DocumentRenderer;
  notifications: Notifier;
}

const modules: Record<string, CountryModule> = {
  NG: { ...nigeriaModule, payment: ngPay, tax: ngTax, verification: ngVer, legal: ngLeg, documents: ngDoc, notifications: ngNot },
  GH: { ...ghanaModule, payment: ghPay, tax: ghTax, verification: ghVer, legal: ghLeg, documents: ghDoc, notifications: ghNot },
  BJ: { ...beninModule, payment: bjPay, tax: bjTax, verification: bjVer, legal: bjLeg, documents: bjDoc, notifications: bjNot },
  GB: { ...ukModule, payment: gbPay, tax: gbTax, verification: gbVer, legal: gbLeg, documents: gbDoc, notifications: gbNot },
  IT: { ...italyModule, payment: itPay, tax: itTax, verification: itVer, legal: itLeg, documents: itDoc, notifications: itNot },
};

export function getCountryModule(code: string): CountryModule | null {
  return modules[code.toUpperCase()] ?? null;
}

export function getAllCountryModules(): CountryModule[] {
  return Object.values(modules);
}

export function isCountrySupported(code: string): boolean {
  return code.toUpperCase() in modules;
}
