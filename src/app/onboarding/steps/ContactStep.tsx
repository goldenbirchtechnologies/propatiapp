'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingContactSchema, onboardingPhoneVerifySchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function ContactStep() {
  const [mode, setMode] = useState<'request' | 'verify'>('request');
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const requestForm = useForm({ resolver: zodResolver(onboardingContactSchema) });

  async function handleRequest() {
    const values = requestForm.getValues();
    setSaving(true);
    try {
      const res = await fetch('/api/onboarding/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setMessage('A 6-digit code has been sent. Check your messages.');
      setMode('verify');
    } catch (e: any) {
      setMessage(e.message || 'Could not send code');
    } finally {
      setSaving(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/onboarding/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'That code did not work');
      setMessage('Phone verified successfully.');
      window.location.hash = '#step-complete';
    } catch (e: any) {
      setMessage(e.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {mode === 'request' ? (
        <>
          <p className="text-sm text-zinc-400 mb-4">
            Add a Nigerian phone number in E.164 format (+234...). We will send a short code to confirm it.
          </p>
          <div className="space-y-3">
            <Label htmlFor="contact-phone">Phone number</Label>
            <Input
              id="contact-phone"
              placeholder="+234 801 234 5678"
              {...requestForm.register('phone')}
            />
          </div>
          <Button onClick={handleRequest} disabled={saving} className="w-full bg-[#10b981] hover:bg-[#006c49] mt-4">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send verification code
          </Button>
        </>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <Label htmlFor="contact-code">6-digit code</Label>
          <Input
            id="contact-code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <Button type="submit" disabled={saving || code.length !== 6} className="w-full bg-[#10b981] hover:bg-[#006c49]">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify
          </Button>
        </form>
      )}
      {message && (
        <p className="text-sm p-3 rounded-lg bg-[#27272a]/20 text-zinc-300">{message}</p>
      )}
    </div>
  );
}
