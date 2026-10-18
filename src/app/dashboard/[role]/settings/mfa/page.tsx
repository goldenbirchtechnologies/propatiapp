'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Shield, ShieldCheck, ShieldOff, Smartphone, Key, AlertTriangle,
  CheckCircle, Copy, RefreshCw, Loader2, QrCode, Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui';
import DashboardShell from '@/components/layout/DashboardShell';
import { getNavigationForRole } from '@/lib/navigation';

interface MFAStatus {
  totpEnabled: boolean;
  totpVerified: boolean;
  recoveryCodesCount: number;
  smsBackupEnabled: boolean;
  enforcementLevel: 'disabled' | 'optional' | 'required';
}

export default function MFASettingsPage() {
  const params = useParams();
  const role = typeof params.role === 'string' ? params.role : 'tenant';

  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  useEffect(() => {
    fetchMFAStatus();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users/mfa/status');
      if (!response.ok) throw new Error('Failed to fetch MFA status');
      const data = await response.json();
      setMfaStatus(data.data);
    } catch (error) {
      console.error('Failed to fetch MFA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTOTPEnrollment = async () => {
    try {
      setIsEnrolling(true);
      setVerifyError(null);
      const response = await fetch('/api/users/mfa/totp/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to start TOTP enrollment');
      const data = await response.json();
      setTotpUri(data.data.uri);
      setManualKey(data.data.secret);
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : 'Failed to start enrollment');
    } finally {
      setIsEnrolling(false);
    }
  };

  const verifyTOTP = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setVerifyError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsVerifying(true);
      setVerifyError(null);
      const response = await fetch('/api/users/mfa/totp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: totpCode }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid code');
      }

      const data = await response.json();
      setRecoveryCodes(data.data.recoveryCodes || []);
      setShowRecoveryCodes(true);
      setTotpUri(null);
      setManualKey(null);
      setTotpCode('');
      fetchMFAStatus();
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const disableTOTP = async () => {
    if (!window.confirm('Are you sure you want to disable MFA? This will make your account less secure.')) {
      return;
    }

    try {
      setIsDisabling(true);
      const response = await fetch('/api/users/mfa/totp/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to disable MFA');
      fetchMFAStatus();
    } catch (error) {
      console.error('Failed to disable MFA:', error);
    } finally {
      setIsDisabling(false);
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navigation = getNavigationForRole(role);

  if (isLoading) {
    return (
      <DashboardShell navigation={navigation} userRole={role}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!mfaStatus) {
    return (
      <DashboardShell navigation={navigation} userRole={role}>
        <div className="text-center py-20">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-red-500">Failed to load MFA settings</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={navigation} userRole={role}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">MFA Settings</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage multi-factor authentication for your account
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* TOTP Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    mfaStatus.totpEnabled
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-zinc-500/10 text-zinc-500'
                  }`}
                >
                  {mfaStatus.totpEnabled ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <ShieldOff className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TOTP Status</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {mfaStatus.totpEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Codes */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Recovery Codes</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {mfaStatus.recoveryCodesCount} remaining
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMS Backup */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    mfaStatus.smsBackupEnabled
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-zinc-500/10 text-zinc-500'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SMS Backup</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {mfaStatus.smsBackupEnabled ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enforcement */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    mfaStatus.enforcementLevel === 'required'
                      ? 'bg-amber-500/10 text-amber-500'
                      : mfaStatus.enforcementLevel === 'optional'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-zinc-500/10 text-zinc-500'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enforcement</p>
                  <p className="font-semibold text-zinc-900 dark:text-white capitalize">
                    {mfaStatus.enforcementLevel}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TOTP Enrollment Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
              <QrCode className="w-5 h-5" />
              Authenticator App (TOTP)
            </CardTitle>
            <CardDescription>
              Use an authenticator app like Google Authenticator or Authy for two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showRecoveryCodes ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-medium">MFA enabled successfully!</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                    Save these recovery codes in a safe place. Each code can only be used once.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {recoveryCodes.map((code, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm text-zinc-900 dark:text-white"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button onClick={copyRecoveryCodes} variant="outline" size="sm">
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy All Codes
                      </>
                    )}
                  </Button>
                </div>
                <Button onClick={() => setShowRecoveryCodes(false)} variant="outline">
                  Done
                </Button>
              </div>
            ) : totpUri ? (
              <div className="space-y-6">
                {/* QR Code placeholder */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-48 h-48 rounded-xl bg-white p-4 flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="w-24 h-24 text-zinc-900 mx-auto mb-2" />
                      <p className="text-xs text-zinc-500">Scan with your authenticator app</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Can't scan? Enter manually:</p>
                    <code className="px-3 py-1.5 rounded bg-muted text-sm font-mono text-zinc-900 dark:text-white">
                      {manualKey}
                    </code>
                  </div>
                </div>

                {/* Verification Input */}
                <div className="max-w-xs mx-auto">
                  <label htmlFor="totp-code" className="block text-sm font-medium text-zinc-900 dark:text-white mb-2 text-center">
                    Enter 6-digit code
                  </label>
                  <input
                    id="totp-code"
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center text-2xl font-mono tracking-[0.5em] text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  {verifyError && (
                    <p className="mt-2 text-sm text-red-500 text-center">{verifyError}</p>
                  )}
                  <Button
                    onClick={verifyTOTP}
                    disabled={isVerifying || totpCode.length !== 6}
                    className="w-full mt-4"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enable'
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setTotpUri(null);
                      setManualKey(null);
                      setTotpCode('');
                      setVerifyError(null);
                    }}
                    variant="ghost"
                    className="w-full mt-2"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : mfaStatus.totpEnabled ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">TOTP is enabled</p>
                    <p className="text-sm text-muted-foreground">Your account is protected with an authenticator app</p>
                  </div>
                </div>
                <Button
                  onClick={disableTOTP}
                  variant="destructive"
                  disabled={isDisabling}
                >
                  {isDisabling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    'Disable MFA'
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Lock className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                  Two-factor authentication is not enabled
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Add an extra layer of security to your account by enabling TOTP-based two-factor authentication.
                </p>
                <Button onClick={startTOTPEnrollment} disabled={isEnrolling}>
                  {isEnrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Enable MFA
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recovery Codes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-white">
              <Key className="w-5 h-5" />
              Recovery Codes
            </CardTitle>
            <CardDescription>
              Recovery codes can be used to access your account if you lose your authenticator device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {mfaStatus.recoveryCodesCount} codes remaining
                </p>
                <p className="text-sm text-muted-foreground">
                  Each code can only be used once
                </p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/users/mfa/recovery-codes/regenerate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                    });
                    if (response.ok) {
                      const data = await response.json();
                      setRecoveryCodes(data.data.codes || []);
                      setShowRecoveryCodes(true);
                      fetchMFAStatus();
                    }
                  } catch (error) {
                    console.error('Failed to regenerate codes:', error);
                  }
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
