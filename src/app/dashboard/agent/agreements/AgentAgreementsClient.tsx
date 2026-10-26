'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Agreement {
  id: string;
  type: 'rental' | 'sale' | 'short_let' | 'share';
  status: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    address: string;
  };
  landlord: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  tenant: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  rentAmount: number;
  cautionDeposit: number;
  startDate: string | null;
  endDate: string | null;
}

interface AgentAgreementsClientProps {
  agreements: Agreement[];
}

export default function AgentAgreementsClient({ agreements }: AgentAgreementsClientProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'signed' | 'draft'>('all');

  const filteredAgreements = agreements.filter((agr) => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(agr.status);
    if (filter === 'signed') return ['fully_signed', 'active'].includes(agr.status);
    if (filter === 'draft') return agr.status === 'draft';
    return true;
  });

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'gray' },
    pending_landlord: { label: 'Pending Landlord', color: 'blue' },
    pending_tenant: { label: 'Pending Tenant', color: 'blue' },
    tenant_signed: { label: 'Tenant Signed', color: 'blue' },
    landlord_signed: { label: 'Landlord Signed', color: 'blue' },
    fully_signed: { label: 'Fully Signed', color: 'green' },
    active: { label: 'Active', color: 'green' },
    expired: { label: 'Expired', color: 'gray' },
    terminated: { label: 'Terminated', color: 'red' },
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rental: 'Rental',
      sale: 'Sale',
      short_let: 'Short Let',
      share: 'Room Share',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Agreements</h2>
        <Button variant="outline" asChild>
          <a href="/dashboard/agent/agreements/new">New Agreement</a>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justifybetween space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agreements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agreements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justifybetween space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agreements.filter((a) => ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justifybetween space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agreements.filter((a) => ['fully_signed', 'active'].includes(a.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justifybetween space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agreements.filter((a) => a.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({agreements.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'signed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('signed')}
        >
          Signed
        </Button>
        <Button
          variant={filter === 'draft' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('draft')}
        >
          Drafts
        </Button>
      </div>

      {/* Agreements Table */}
      {filteredAgreements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No agreements found.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left font-medium">Property</th>
                <th className="px-4 py-2 text-left font-medium">Tenant</th>
                <th className="px-4 py-2 text-left font-medium">Type</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Start Date</th>
                <th className="px-4 py-2 text-left font-medium">End Date</th>
                <th className="px-4 py-2 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgreements.map((agr) => (
                <tr key={agr.id} className="border-t">
                  <td className="px-4 py-2">
                    <div>
                      <div className="font-medium">{agr.listing.title}</div>
                      <div className="text-sm text-muted-foreground">{agr.listing.address}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {agr.tenant ? agr.tenant.fullName : 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant="outline">{getTypeLabel(agr.type)}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <Badge
                      variant={statusConfig[agr.status]?.color as any}
                    >
                      {statusConfig[agr.status]?.label || agr.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    {agr.startDate ? format(new Date(agr.startDate), 'PPP') : 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    {agr.endDate ? format(new Date(agr.endDate), 'PPP') : 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    <Button size="sm" asChild>
                      <a href={`/dashboard/agent/deals/${agr.id}`}>View</a>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}