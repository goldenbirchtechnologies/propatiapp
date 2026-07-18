'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EstateManagerBulkImportPage() {
  const [status, setStatus] = useState<'idle' | 'uploaded' | 'processing' | 'done'>('idle');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Bulk Import</h1>
        <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>Upload thousands of properties via CSV or Excel</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Upload File</h2>
            <div className="border-2 border-dashed rounded-xl p-10 text-center" style={{ borderColor: 'border-border' }}>
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'text-muted-foreground' }} />
              <p className="text-sm font-medium" style={{ color: 'text-primary' }}>Click to upload or drag and drop</p>
              <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-muted-foreground' }}>CSV, XLSX or XLS (max. 50MB)</p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Import Status</h2>
            {status === 'idle' ? (
              <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>No active import. Upload a file to begin.</p>
            ) : status === 'processing' ? (
              <div className="space-y-3">
                <div className="h-2 rounded-full bg-muted/30 overflow-hidden"><div className="h-2 rounded-full animate-pulse" style={{ width: '60%', background: 'text-primary' }} /></div>
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Processing 3,240 of 5,412 rows...</p>
              </div>
            ) : status === 'done' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-success" /> <span className="text-sm font-medium">Import completed</span></div>
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>5,412 properties loaded. 0 errors.</p>
              </div>
            ) : (
              <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-warning" /> <span className="text-sm font-medium">Ready to process</span></div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-headline-sm font-bold mb-3" style={{ color: 'text-primary' }}>Template</h3>
            <p className="text-xs font-label-md uppercase tracking-wider mb-4" style={{ color: 'text-muted-foreground' }}>Use the official template to avoid column mapping errors.</p>
            <button className="btn btn-outline w-full inline-flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download Template</button>
          </div>
          <div className="card p-6">
            <h3 className="font-headline-sm font-bold mb-3" style={{ color: 'text-primary' }}>Rules</h3>
            <ul className="space-y-3 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>
              <li>• Max file size: 50MB</li>
              <li>• Headers must match template</li>
              <li>• Date format: DD/MM/YYYY</li>
              <li>• Duplicates will be skipped</li>
              <li>• Emails must be unique</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
