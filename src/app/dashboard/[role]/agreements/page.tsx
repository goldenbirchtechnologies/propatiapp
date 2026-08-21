'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Plus, FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAgreements } from '@/hooks/useAgreements';
import { AgreementStatusBadge } from '@/components/agreements/agreement-status-badge';

type AgreementStatus = 'all' | 'draft' | 'pending' | 'active' | 'expired';

export default function AgreementsPage() {
  const params = useParams();
  const router = useRouter();
  const role = params.role as 'landlord' | 'tenant';
  const [activeTab, setActiveTab] = useState<AgreementStatus>('all');

  const { data: agreements, isLoading } = useAgreements();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const filterAgreements = (status: AgreementStatus) => {
    if (!agreements?.data) return [];
    if (status === 'all') return agreements.data;
    if (status === 'pending') {
      return agreements.data.filter((a) =>
        ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status)
      );
    }
    if (status === 'active') {
      return agreements.data.filter((a) => a.status === 'fully_signed');
    }
    return agreements.data.filter((a) => a.status === status);
  };

  const filteredAgreements = filterAgreements(activeTab);

  const handleViewAgreement = (id: string) => {
    router.push(`/dashboard/${role}/agreements/${id}`);
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const res = await fetch(`/api/agreements/${id}/pdf`);
      if (!res.ok) throw new Error('Failed to download PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agreement-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agreements</h1>
          <p className="text-muted-foreground">
            {role === 'landlord'
              ? 'Manage your rental agreements and track signatures'
              : 'View and sign your rental agreements'}
          </p>
        </div>
        {role === 'landlord' && (
          <Button onClick={() => router.push(`/dashboard/landlord/agreements/new`)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Agreement
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AgreementStatus)}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="pending">Pending Signature</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </Card>
              ))}
            </div>
          ) : filteredAgreements.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No agreements found</h3>
                <p className="text-muted-foreground mb-6">
                  {role === 'landlord'
                    ? 'Create your first agreement to get started'
                    : 'No agreements available at this time'}
                </p>
                {role === 'landlord' && (
                  <Button onClick={() => router.push(`/dashboard/landlord/agreements/new`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Agreement
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgreements.map((agreement) => (
                <Card key={agreement.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    {/* Property Image & Title */}
                    <div className="flex items-start gap-3">
                      {agreement.listing?.photos?.[0] && (
                        <img
                          src={agreement.listing.photos[0]}
                          alt={agreement.listing.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {agreement.listing?.title || 'Property'}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {agreement.listing?.address}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <AgreementStatusBadge status={agreement.status} />
                    </div>

                    {/* Other Party */}
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {role === 'landlord' ? 'Tenant' : 'Landlord'}
                      </p>
                      <p className="font-medium">
                        {role === 'landlord'
                          ? agreement.tenant?.fullName || 'Unknown'
                          : agreement.landlord?.fullName || 'Unknown'}
                      </p>
                    </div>

                    {/* Rent Amount */}
                    <div>
                      <p className="text-xs text-muted-foreground">Rent Amount</p>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(agreement.rentAmount || 0)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{agreement.rentPeriod || 'month'}
                        </span>
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>
                        <p>Start</p>
                        <p className="font-medium text-white">
                          {agreement.startDate
                            ? format(new Date(agreement.startDate), 'MMM dd, yyyy')
                            : 'TBD'}
                        </p>
                      </div>
                      <div>
                        <p>End</p>
                        <p className="font-medium text-white">
                          {agreement.endDate
                            ? format(new Date(agreement.endDate), 'MMM dd, yyyy')
                            : 'TBD'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewAgreement(agreement.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {agreement.status === 'fully_signed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(agreement.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
