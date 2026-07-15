'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Calendar, History, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface BusinessListingDetailClientProps {
  type: string;
}
import MaterialIcon from '@/components/icons/material-icon';
export default function BusinessListingDetailClient({ type }: BusinessListingDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const title = type
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => router.push('/admin/business')} className="hover:text-foreground">
            Business
          </button>
          <MaterialIcon name="/" className="material-symbols-outlined" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
        </nav>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Listing Overview</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Basic details for {title} will appear here.</p>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Change History</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Audit trail for {title} will be shown here.</p>
        <TabsContent value="documents" className="mt-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Documents</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Documents for {title} will be listed here.</p>
      </Tabs>
  );

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Calendar, History, User } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface BusinessListingDetailClientProps {
  type: string;
}
import MaterialIcon from '@/components/icons/material-icon';

export default function BusinessListingDetailClient({ type }: BusinessListingDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const title = type
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="h-6 w-px bg-border" />
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => router.push('/admin/business')} className="hover:text-foreground">
            Business
          </button>
          <MaterialIcon name="/" className="material-symbols-outlined" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
        </nav>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Listing Overview</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Basic details for {title} will appear here.</p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Change History</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Audit trail for {title} will be shown here.</p>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Documents</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Documents for {title} will be listed here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
