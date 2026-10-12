'use client';

import { useState, useCallback } from 'react';
import { useActiveOrganizationId } from '@/contexts/ActiveOrganizationContext';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { NoOrgState } from '@/components/organizations/NoOrgState';
import { Upload, FileText, CheckCircle, AlertCircle, Download, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function EstateManagerBulkImportPage() {
  const [status, setStatus] = useState<'idle' | 'uploaded' | 'processing' | 'done'>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const { orgId, loading: orgLoading } = useActiveOrganizationId();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus('uploaded');

    // Simulate pre-flight validation + row count
    const lines = file.text ? null : null;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const lines = text.trim().split('\n');
        setRowCount(Math.max(0, lines.length - 1)); // minus header
      }
    };
    reader.readAsText(file);
  }, []);

  const handleProcess = useCallback(() => {
    setStatus('processing');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('done');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  }, []);

  if (orgLoading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Manager">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </DashboardShell>
    );
  }

  if (!orgId) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Manager">
        <NoOrgState
          title="No Organization"
          description="You need an organization to import properties. Create one or link an existing organization."
          actionLabel="Create Organization"
          actionHref="/dashboard/estate-manager/profile"
          secondaryLabel="Link Organization"
          secondaryHref="/dashboard/estate-manager/invite-property-manager"
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Manager">
      <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-headline-sm font-bold text-zinc-900 dark:text-white">Bulk Import</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Upload thousands of properties via CSV or Excel</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <div className="glass-card p-6">
              <h2 className="font-headline-sm font-bold text-zinc-900 dark:text-white mb-4">Upload File</h2>
              <div className="border-2 border-dashed rounded-xl p-10 text-center border-zinc-200 dark:border-white/[0.08]">
                <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-600 dark:text-zinc-400" />
                <p className="text-sm font-medium text-zinc-900 dark:text-white">Click to upload or drag and drop</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">CSV, XLSX or XLS (max. 50MB)</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block mt-4 px-4 py-2 border border-zinc-200 dark:border-white/[0.08] rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  Choose File
                </label>
              </div>

              {fileName && (
                <div className="mt-4 p-4 bg-muted/10 rounded-lg flex items-center gap-3">
                  <FileText className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{fileName}</p>
                    {rowCount !== null && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{rowCount.toLocaleString()} data rows detected</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Import Status */}
            <div className="glass-card p-6">
              <h2 className="font-headline-sm font-bold text-zinc-900 dark:text-white mb-4">Import Status</h2>

              {status === 'idle' ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">No active import. Upload a file to begin.</p>
              ) : status === 'uploaded' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#10b981]" />
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">File uploaded successfully</span>
                  </div>
                  {rowCount !== null && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{rowCount.toLocaleString()} rows ready for processing</p>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleProcess} className="bg-blue-600 hover:bg-blue-700">
                      Process Import
                    </Button>
                    <Button variant="outline" onClick={() => setStatus('idle')}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : status === 'processing' ? (
                <div className="space-y-3">
                  <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Processing {rowCount || 0} rows...</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{progress}%</p>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Do not close this page while import is in progress.</p>
                </div>
              ) : status === 'done' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#10b981]" />
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">Import completed</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{rowCount || 0} properties loaded. 0 errors.</p>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">Ready to process</span>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-headline-sm font-bold text-zinc-900 dark:text-white mb-3">Template</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Use the official template to avoid column mapping errors.</p>
              <Button variant="outline" className="w-full inline-flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download Template
              </Button>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-headline-sm font-bold text-zinc-900 dark:text-white mb-3">Rules</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#10b981]" /> Max file size: 50MB</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#10b981]" /> Headers must match template</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#10b981]" /> Date format: DD/MM/YYYY</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#10b981]" /> Duplicates will be skipped</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#10b981]" /> Emails must be unique</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
