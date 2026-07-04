'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Calculator, BookmarkPlus, Share2, TrendingUp } from 'lucide-react';

/* ================================================================
   MORTGAGE CALCULATOR — public page with sliders, result summary,
   save/share interactions. All styling uses design tokens only.
   ================================================================ */

function fmtNaira(value: number) {
  return `₦${Math.round(value).toLocaleString('en-NG')}`;
}

export default function MortgageCalculatorPage() {
  const [price, setPrice] = useState(25_000_000);
  const [downPayment, setDownPayment] = useState(5_000_000);
  const [interestRate, setInterestRate] = useState(12);
  const [loanTerm, setLoanTerm] = useState(20);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const principal = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  const monthlyPayment = useMemo(() => {
    if (principal <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) return 0;
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
  }, [principal, monthlyRate, numberOfPayments]);

  const totalPayment = monthlyPayment * numberOfPayments + downPayment;
  const totalInterest = monthlyPayment * numberOfPayments - principal;

  const handleSave = () => setSaved((s) => !s);
  const handleShare = async () => {
    setShared(true);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PROPATI Mortgage Calculator',
          text: `Monthly payment: ${fmtNaira(monthlyPayment)} for a ${fmtNaira(price)} home.`,
          url: window.location.href,
        });
      } catch {
        // user cancelled or failed silently
      }
    }
    setTimeout(() => setShared(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-3">
              Tools
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Mortgage Calculator
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl">
              Estimate your monthly repayments, total interest, and plan your property purchase with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Inputs */}
            <Card className="lg:col-span-5 rounded-lg border-border shadow-1 bg-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Loan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Home Price</Label>
                    <span className="text-sm font-semibold text-foreground">{fmtNaira(price)}</span>
                  </div>
                  <Slider
                    value={[price]}
                    min={1_000_000}
                    max={500_000_000}
                    step={500_000}
                    onValueChange={(v) => setPrice(v[0])}
                  />
                </div>

                {/* Down Payment */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Down Payment</Label>
                    <span className="text-sm font-semibold text-foreground">{fmtNaira(downPayment)}</span>
                  </div>
                  <Slider
                    value={[downPayment]}
                    min={0}
                    max={price}
                    step={500_000}
                    onValueChange={(v) => setDownPayment(v[0])}
                  />
                </div>

                {/* Interest Rate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Interest Rate (yearly)</Label>
                    <span className="text-sm font-semibold text-foreground">{interestRate}%</span>
                  </div>
                  <Slider
                    value={[interestRate]}
                    min={1}
                    max={40}
                    step={0.5}
                    onValueChange={(v) => setInterestRate(v[0])}
                  />
                </div>

                {/* Loan Term */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Loan Term</Label>
                    <span className="text-sm font-semibold text-foreground">{loanTerm} years</span>
                  </div>
                  <Slider
                    value={[loanTerm]}
                    min={1}
                    max={35}
                    step={1}
                    onValueChange={(v) => setLoanTerm(v[0])}
                  />
                </div>

                {/* Manual overrides */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Price</Label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Down Payment</Label>
                    <Input
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="rounded-lg border-border shadow-1 bg-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Repayment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs text-muted-foreground mb-1">Monthly Repayment</p>
                      <p className="text-xl md:text-2xl font-bold text-primary">
                        {fmtNaira(monthlyPayment)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Total Amount Payable</p>
                      <p className="text-xl md:text-2xl font-bold text-foreground">
                        {fmtNaira(totalPayment)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
                      <p className="text-xl md:text-2xl font-bold text-foreground">
                        {fmtNaira(totalInterest)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      variant={saved ? 'default' : 'outline'}
                      className="gap-2"
                      onClick={handleSave}
                    >
                      <BookmarkPlus className="h-4 w-4" />
                      {saved ? 'Saved' : 'Save Estimate'}
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                      {shared ? 'Copied!' : 'Share'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info */}
              <Card className="rounded-lg border-border shadow-1 bg-card">
                <CardHeader>
                  <CardTitle className="text-base">How to use</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Adjust the sliders or enter values manually to see your estimated monthly repayment.</p>
                  <p>
                    This calculator provides an estimate only. Actual rates may vary based on lender
                    policies, credit score, and additional fees.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
