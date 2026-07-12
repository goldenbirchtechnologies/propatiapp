'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard, Lock, Eye, EyeOff, Verified
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, '0')
);
const years = Array.from({ length: 10 }, (_, i) =>
  String(new Date().getFullYear() + i)
);

const networkIcons: Record<string, { src: string; alt: string }> = {
  visa: {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB36dPnrHEkEdaRi4BBqq9VdaSV4R4KBt5OzoCz-xupv8aZWlmZA5WMAJJbog6IY2iaATyTvjZ0rD_RSI4nJaeh-beBSaNctcGInUGwkkrkx0w_qW5GdrLz_fX47y5rmEQ6B_7vO94BJuGE1jkdrbxHRh8cKwqbFKVlIQc8o0J8KmPpRB18V5zEVh2vECF7PHe87as0EUO0NC1Ya9-JoAO7b8dYGu69frYPsW6yBnNgKYGrQYrEO7bN',
    alt: 'Visa',
  },
  mastercard: {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqO0VwHKHQaS5EHzcFHyFbxfz9SnernfQ2k7aEE9hY1KVilhyZb7pQabFYnkUymeKiaR7T6mHOk1gHyRJeTQw3G2IYbTzZKW4VhanENqI3ggbUNLsIs1vDJaE0Tw9Tz6BGwdLkl9SUoyMWrZmtBjJbrPxDwLIdxqbzUGDr39ZvJNHclJ4b_Tq3So1grJyZtKy2O0W5VBbdpwo94QQ2Zt4BF-IrphXkyjtfZDgchwSrbjzxLCvSYDSY',
    alt: 'Mastercard',
  },
};

const banks = [
  'Guaranty Trust Bank',
  'Zenith Bank',
  'Access Bank',
  'First Bank of Nigeria',
];

export default function AddPaymentMethodClient({ methodType }: { methodType: string }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('Enter account number to fetch name');
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [saveInfo, setSaveInfo] = useState(true);
  const [selectedBank, setSelectedBank] = useState('');
  const [activeTab, setActiveTab] = useState<'card' | 'bank'>(
    methodType === 'bank' ? 'bank' : 'card'
  );

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAccountNumber(val);
    if (val.length === 10) {
      setLoadingAccount(true);
      setAccountName('Fetching...');
      setTimeout(() => {
        setLoadingAccount(false);
        setAccountName('ADEWALE SULEIMAN BOLAJI');
      }, 1200);
    } else {
      setLoadingAccount(false);
      setAccountName('Enter account number to fetch name');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/tenant/payments" className="font-mono text-muted-foreground hover:text-primary transition-colors">
          PAYMENTS
        </Link>
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/dashboard/tenant/payments" className="font-mono text-muted-foreground hover:text-primary transition-colors">
          SAVED METHODS
        </Link>
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-mono text-primary font-semibold">ADD PAYMENT METHOD</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-full bg-primary-dark text-white flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-heading text-xl font-bold text-primary">Add Payment Method</h1>
                  <p className="text-sm text-muted-foreground">Securely link your card or bank details.</p>
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'card' | 'bank')}
                className="space-y-6"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="card" className="flex-1">
                    Debit/Credit Card
                  </TabsTrigger>
                  <TabsTrigger value="bank" className="flex-1">
                    Bank Account
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-label-md label-md text-on-surface-variant">
                      Cardholder Name
                    </Label>
                    <Input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="h-11"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-label-md label-md text-on-surface-variant">
                      Card Number
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCard(e.target.value))}
                        className="font-mono tracking-widest pr-28"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <img
                          alt="Visa"
                          className="h-4"
                          style={{ filter: 'grayscale(1) opacity(0.5)' }}
                          src={networkIcons.visa.src}
                        />
                        <img
                          alt="Mastercard"
                          className="h-4"
                          style={{ filter: 'grayscale(1) opacity(0.5)' }}
                          src={networkIcons.mastercard.src}
                        />
                        <div className="h-4 px-1 bg-primary-dark text-[8px] font-bold text-white rounded flex items-center justify-center">
                          VERVE
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-label-md label-md text-on-surface-variant">
                        Expiry Date
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <select className="h-11 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest appearance-none text-sm">
                          <option value="">MM</option>
                          {months.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <select className="h-11 px-3 rounded-lg border border-outline-variant bg-surface-container-lowest appearance-none text-sm">
                          <option value="">YY</option>
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-label-md label-md text-on-surface-variant flex items-center gap-xs">
                        CVV
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant cursor-help" title="3-digit security code on the back of your card">
                          info
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                          type={showSecurity ? 'text' : 'password'}
                          maxLength={4}
                          placeholder="***"
                          className="font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecurity(!showSecurity)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
                        >
                          {showSecurity ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="save"
                      checked={saveInfo}
                      onCheckedChange={(c) => setSaveInfo(c === true)}
                    />
                    <Label htmlFor="save" className="text-sm text-on-surface leading-relaxed">
                      Save Card for Future Payments
                    </Label>
                  </div>
                </TabsContent>

                <TabsContent value="bank" className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-label-md label-md text-on-surface-variant">
                      Select Bank
                    </Label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full h-11 px-4 rounded-lg border border-outline-variant bg-surface-container-lowest appearance-none text-sm"
                    >
                      <option value="">Choose your bank</option>
                      {banks.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-label-md label-md text-on-surface-variant">
                      Account Number
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={accountNumber}
                        onChange={handleAccountNumberChange}
                        placeholder="0123456789"
                        className="pr-10"
                      />
                      <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${loadingAccount ? '' : 'hidden'}`}>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-label-md label-md text-on-surface-variant">
                      Account Name
                    </Label>
                    <div className="flex items-center gap-sm w-full h-11 px-4 bg-surface-container rounded-lg border border-outline-variant text-sm">
                      <span className={accountName.includes('Fetching') ? 'text-on-surface-variant' : 'text-primary font-semibold'}>
                        {accountName}
                      </span>
                      {accountName === 'ADEWALE SULEIMAN BOLAJI' && (
                        <Verified className="w-4 h-4 text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }} />
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 mt-6">
                <Link href="/dashboard/tenant/payments">
                  <Button variant="ghost">Cancel</Button>
                </Link>
                <Link href="/dashboard/tenant/payments/auto-pay">
                  <Button disabled={!agreeTerms} className="flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Securely Add
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Security bento */}
        <div className="space-y-5">
          <Card className="bg-surface-variant border-outline-variant">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h4 className="font-heading text-base font-semibold text-primary mb-2">Trust Shield</h4>
              <p className="text-sm text-on-surface-variant">Your financial data is secured by 256-bit SSL encryption.</p>
            </CardContent>
          </Card>
          <Card className="bg-muted border-outline-variant flex items-center gap-4 p-5">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-outline-variant">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">PCI-DSS Compliant</p>
              <p className="text-xs text-on-surface-variant">Routers-Atlas applies for all transfers.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
