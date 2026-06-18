'use client';

import * as React from 'react';
import { Download, Print, Pen, Check, X, AlertCircle, FileText, User, Building, Calendar, DollarSign, Key, Hash, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency, formatDate } from '@/lib/utils';

export interface AgreementData {
  id: string;
  reference: string;
  status: 'draft' | 'pending_landlord' | 'pending_tenant' | 'tenant_signed' | 'landlord_signed' | 'fully_signed' | 'terminated' | 'expired';
  type: 'rent' | 'sale' | 'short_let' | 'commercial';
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    images: string[];
  };
  landlord: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  agent?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    commissionRate: number;
  };
  terms: {
    rentAmount?: number;
    depositAmount?: number;
    salePrice?: number;
    startDate?: string;
    endDate?: string;
    durationMonths?: number;
    paymentFrequency?: 'monthly' | 'quarterly' | 'annually' | 'one_time';
    dueDay?: number;
    utilitiesIncluded?: string[];
    furnishings?: string[];
    specialConditions?: string;
    maintenanceResponsibility?: 'landlord' | 'tenant' | 'shared';
  };
  signatures: {
    landlord?: { signedAt: string; ipAddress: string; userAgent: string; checksum: string };
    tenant?: { signedAt: string; ipAddress: string; userAgent: string; checksum: string };
  };
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  pdfUrl?: string;
}

export interface AgreementPreviewProps {
  agreement: AgreementData;
  currentUserRole: 'landlord' | 'tenant' | 'agent' | 'admin';
  currentUserId: string;
  onSign?: (agreementId: string, role: 'landlord' | 'tenant') => Promise<void>;
  onDownload?: (agreementId: string) => Promise<void>;
  onPrint?: (agreementId: string) => void;
  onReject?: (agreementId: string, reason: string) => Promise<void>;
  className?: string;
  showActions?: boolean;
}

const statusConfig = {
  draft: { label: 'Draft', variant: 'secondary' as const, icon: <FileText className="h-3 w-3" />, description: 'Agreement created, awaiting review' },
  pending_landlord: { label: 'Pending Landlord', variant: 'outline' as const, icon: <Clock className="h-3 w-3" />, description: 'Waiting for landlord to review and sign' },
  pending_tenant: { label: 'Pending Tenant', variant: 'outline' as const, icon: <Clock className="h-3 w-3" />, description: 'Waiting for tenant to review and sign' },
  tenant_signed: { label: 'Tenant Signed', variant: 'default' as const, icon: <Check className="h-3 w-3" />, description: 'Tenant has signed, awaiting landlord' },
  landlord_signed: { label: 'Landlord Signed', variant: 'default' as const, icon: <Check className="h-3 w-3" />, description: 'Landlord has signed, awaiting tenant' },
  fully_signed: { label: 'Fully Signed', variant: 'success' as const, icon: <Shield className="h-3 w-3" />, description: 'All parties have signed - legally binding' },
  terminated: { label: 'Terminated', variant: 'destructive' as const, icon: <X className="h-3 w-3" />, description: 'Agreement has been terminated' },
  expired: { label: 'Expired', variant: 'destructive' as const, icon: <AlertCircle className="h-3 w-3" />, description: 'Agreement has expired' },
};

const typeLabels = {
  rent: 'Rental Agreement',
  sale: 'Sale Agreement',
  short_let: 'Short Let Agreement',
  commercial: 'Commercial Lease',
};

function AgreementHeader({ agreement, currentUserRole }: { agreement: AgreementData; currentUserRole: string }) {
  const config = statusConfig[agreement.status];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-heading text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {typeLabels[agreement.type]}
            </h1>
            <Badge variant={config.variant} className="gap-1.5 px-3 py-1">
              {config.icon}
              {config.label}
            </Badge>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{config.description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <span>Ref: </span>
          <code className="font-mono bg-muted px-2 py-1 rounded">{agreement.reference}</code>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Created</p>
          <p className="font-medium" style={{ color: 'var(--text)' }}>{formatDate(agreement.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Updated</p>
          <p className="font-medium" style={{ color: 'var(--text)' }}>{formatDate(agreement.updatedAt)}</p>
        </div>
        {agreement.expiresAt && (
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Expires</p>
            <p className="font-medium text-amber-600 dark:text-amber-400">{formatDate(agreement.expiresAt)}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Status</p>
          <p className="font-medium" style={{ color: 'var(--text)' }}>{config.label}</p>
        </div>
      </div>
    </div>
  );
}

function PartyCard({ title, party, icon: Icon, isCurrentUser, role }: {
  title: string;
  party: AgreementData['landlord'];
  icon: React.ReactNode;
  isCurrentUser: boolean;
  role: 'landlord' | 'tenant';
}) {
  return (
    <Card className={cn('relative', isCurrentUser && 'ring-2 ring-accent')}>
      {isCurrentUser && (
        <div className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-0.5 rounded-full font-medium">
          You
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-heading font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            {Icon || party.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text)' }}>{party.name}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <Mail className="h-4 w-4" />
          {party.email}
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
          <Phone className="h-4 w-4" />
          {party.phone}
        </div>
      </CardContent>
    </Card>
  );
}

import { Mail, Phone } from 'lucide-react';

function PartiesSection({ agreement, currentUserRole, currentUserId }: { agreement: AgreementData; currentUserRole: string; currentUserId: string }) {
  const isLandlord = currentUserRole === 'landlord' && agreement.landlord.id === currentUserId;
  const isTenant = currentUserRole === 'tenant' && agreement.tenant.id === currentUserId;

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold" style={{ color: 'var(--text)' }}>Parties</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PartyCard
          title="Landlord"
          party={agreement.landlord}
          icon={<Building className="h-5 w-5" />}
          isCurrentUser={isLandlord}
          role="landlord"
        />
        <PartyCard
          title="Tenant"
          party={agreement.tenant}
          icon={<User className="h-5 w-5" />}
          isCurrentUser={isTenant}
          role="tenant"
        />
      </div>
      {agreement.agent && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-heading font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
                <Building className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: 'var(--text)' }}>{agreement.agent.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Agent ({agreement.agent.commissionRate}% commission)</p>
              </div>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>
                {agreement.agent.email}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PropertySection({ agreement }: { agreement: AgreementData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Property Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            {agreement.property.images[0] ? (
              <img
                src={agreement.property.images[0]}
                alt={agreement.property.title}
                className="w-full aspect-video object-cover rounded-lg"
              />
            ) : (
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center" style={{ color: 'var(--muted)' }}>
                <Home className="h-8 w-8" />
              </div>
            )}
          </div>
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-heading font-semibold text-lg" style={{ color: 'var(--text)' }}>{agreement.property.title}</h4>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
              <MapPin className="h-4 w-4" />
              <span>{agreement.property.address}, {agreement.property.city}, {agreement.property.state}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{agreement.type === 'rent' ? 'Rental' : agreement.type === 'sale' ? 'Sale' : 'Short Let'}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Home, MapPin } from 'lucide-react';

function TermsSection({ agreement, currentUserRole }: { agreement: AgreementData; currentUserRole: string }) {
  const terms = agreement.terms;
  const isRent = agreement.type === 'rent' || agreement.type === 'short_let';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Agreement Terms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isRent && terms.rentAmount && (
            <TermItem label="Monthly Rent" value={formatCurrency(terms.rentAmount)} icon={<DollarSign className="h-4 w-4" />} />
          )}
          {isRent && terms.depositAmount && (
            <TermItem label="Security Deposit" value={formatCurrency(terms.depositAmount)} icon={<Key className="h-4 w-4" />} />
          )}
          {agreement.type === 'sale' && terms.salePrice && (
            <TermItem label="Sale Price" value={formatCurrency(terms.salePrice)} icon={<DollarSign className="h-4 w-4" />} />
          )}

          {terms.startDate && (
            <TermItem label="Start Date" value={formatDate(terms.startDate)} icon={<Calendar className="h-4 w-4" />} />
          )}
          {terms.endDate && (
            <TermItem label="End Date" value={formatDate(terms.endDate)} icon={<Calendar className="h-4 w-4" />} />
          )}
          {terms.durationMonths && (
            <TermItem label="Duration" value={`${terms.durationMonths} months`} icon={<Calendar className="h-4 w-4" />} />
          )}

          {isRent && terms.paymentFrequency && (
            <TermItem label="Payment Frequency" value={terms.paymentFrequency.replace('_', ' ')} icon={<Calendar className="h-4 w-4" />} />
          )}
          {isRent && terms.dueDay && (
            <TermItem label="Due Date" value={`Day ${terms.dueDay} of each period`} icon={<Calendar className="h-4 w-4" />} />
          )}
          {terms.maintenanceResponsibility && (
            <TermItem label="Maintenance" value={terms.maintenanceResponsibility} icon={<Shield className="h-4 w-4" />} />
          )}
        </div>

        {(terms.utilitiesIncluded && terms.utilitiesIncluded.length > 0) || (terms.furnishings && terms.furnishings.length > 0) ? (
          <div className="space-y-3 pt-4 border-t border-border">
            {terms.utilitiesIncluded && terms.utilitiesIncluded.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Utilities Included</p>
                <div className="flex flex-wrap gap-2">
                  {terms.utilitiesIncluded.map((utility) => (
                    <Badge key={utility} variant="secondary" className="text-xs">{utility}</Badge>
                  ))}
                </div>
              </div>
            )}
            {terms.furnishings && terms.furnishings.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Furnishings</p>
                <div className="flex flex-wrap gap-2">
                  {terms.furnishings.map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {terms.specialConditions && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Special Conditions</p>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{terms.specialConditions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TermItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-medium" style={{ color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

function SignaturesSection({ agreement, currentUserRole, currentUserId, onSign }: {
  agreement: AgreementData;
  currentUserRole: string;
  currentUserId: string;
  onSign?: (agreementId: string, role: 'landlord' | 'tenant') => Promise<void>;
}) {
  const isLandlord = currentUserRole === 'landlord' && agreement.landlord.id === currentUserId;
  const isTenant = currentUserRole === 'tenant' && agreement.tenant.id === currentUserId;
  const canSignLandlord = isLandlord && !agreement.signatures.landlord && (agreement.status === 'pending_landlord' || agreement.status === 'tenant_signed');
  const canSignTenant = isTenant && !agreement.signatures.tenant && (agreement.status === 'pending_tenant' || agreement.status === 'landlord_signed');

  const renderSignature = (role: 'landlord' | 'tenant', signature?: AgreementData['signatures']['landlord']) => {
    const party = role === 'landlord' ? agreement.landlord : agreement.tenant;
    const isCurrent = (role === 'landlord' && isLandlord) || (role === 'tenant' && isTenant);
    const canSign = (role === 'landlord' && canSignLandlord) || (role === 'tenant' && canSignTenant);

    return (
      <Card className={cn(canSign && 'ring-2 ring-accent')}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-heading font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
                {role === 'landlord' ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>{party.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{role === 'landlord' ? 'Landlord' : 'Tenant'}</p>
              </div>
            </div>
            {signature ? (
              <Badge variant="success" className="gap-1">
                <Check className="h-3 w-3" />
                Signed
              </Badge>
            ) : canSign ? (
              <Button size="sm" variant="default" onClick={() => onSign?.(agreement.id, role)} className="gap-1">
                <Pen className="h-3.5 w-3.5" />
                Sign Now
              </Button>
            ) : (
              <Badge variant="secondary">Pending</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {signature ? (
            <div className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Signed: {formatDate(signature.signedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{signature.checksum.slice(0, 16)}...</code>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {isCurrent ? 'Click "Sign Now" to electronically sign this agreement' : `Waiting for ${role} to sign`}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold" style={{ color: 'var(--text)' }}>Signatures</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderSignature('landlord', agreement.signatures.landlord)}
        {renderSignature('tenant', agreement.signatures.tenant)}
      </div>

      {(canSignLandlord || canSignTenant) && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Electronic Signature Consent</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                By clicking "Sign Now", you agree to sign this document electronically. Your signature will be legally binding under the Nigerian Evidence Act 2011. 
                A timestamped audit trail (IP address, device info, checksum) will be recorded.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditTrailSection({ agreement }: { agreement: AgreementData }) {
  const events = [
    { type: 'created', label: 'Agreement Created', time: agreement.createdAt, icon: <FileText className="h-4 w-4" /> },
    ...(agreement.signatures.landlord ? [{ type: 'signed', label: 'Landlord Signed', time: agreement.signatures.landlord.signedAt, icon: <Pen className="h-4 w-4" /> }] : []),
    ...(agreement.signatures.tenant ? [{ type: 'signed', label: 'Tenant Signed', time: agreement.signatures.tenant.signedAt, icon: <Pen className="h-4 w-4" /> }] : []),
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.type} className="flex gap-3 relative">
              {index < events.length - 1 && (
                <div className="absolute left-5 top-10 bottom-0 w-0.5" style={{ background: 'var(--border)' }} />
              )}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center relative z-10" style={{ color: 'var(--muted)' }}>
                {event.icon}
              </div>
              <div className="flex-1 pt-1">
                <p className="font-medium" style={{ color: 'var(--text)' }}>{event.label}</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{formatDate(event.time)} at {new Date(event.time).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AgreementPreview({
  agreement,
  currentUserRole,
  currentUserId,
  onSign,
  onDownload,
  onPrint,
  onReject,
  className,
  showActions = true,
}: AgreementPreviewProps) {
  const [activeTab, setActiveTab] = React.useState<'preview' | 'terms' | 'signatures' | 'audit'>('preview');

  const isLandlord = currentUserRole === 'landlord' && agreement.landlord.id === currentUserId;
  const isTenant = currentUserRole === 'tenant' && agreement.tenant.id === currentUserId;
  const canSign = (isLandlord && !agreement.signatures.landlord) || (isTenant && !agreement.signatures.tenant);
  const isFullySigned = agreement.status === 'fully_signed';

  return (
    <div className={cn('space-y-6', className)}>
      <AgreementHeader agreement={agreement} currentUserRole={currentUserRole} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview">Overview</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6 pt-4">
          <PartiesSection agreement={agreement} currentUserRole={currentUserRole} currentUserId={currentUserId} />
          <PropertySection agreement={agreement} />
        </TabsContent>

        <TabsContent value="terms" className="pt-4">
          <TermsSection agreement={agreement} currentUserRole={currentUserRole} />
        </TabsContent>

        <TabsContent value="signatures" className="pt-4">
          <SignaturesSection agreement={agreement} currentUserRole={currentUserRole} currentUserId={currentUserId} onSign={onSign} />
        </TabsContent>

        <TabsContent value="audit" className="pt-4">
          <AuditTrailSection agreement={agreement} />
        </TabsContent>
      </Tabs>

      {showActions && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {agreement.pdfUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={() => onDownload?.(agreement.id)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download signed PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button variant="outline" onClick={() => onPrint?.(agreement.id)}>
              <Print className="mr-2 h-4 w-4" />
              Print
            </Button>
            {!isFullySigned && (canSign || currentUserRole === 'admin') && (
              <Button variant="outline" onClick={() => onReject?.(agreement.id, '')}>
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            )}
          </div>

          {canSign && (
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg text-sm" style={{ color: 'var(--accent)' }}>
              <strong>Action Required:</strong> You need to sign this agreement to proceed.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AgreementPreviewModal({
  agreement,
  currentUserRole,
  currentUserId,
  isOpen,
  onClose,
  onSign,
  onDownload,
  onPrint,
  onReject,
}: AgreementPreviewProps & {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{typeLabels[agreement.type]}</DialogTitle>
          <Badge variant={statusConfig[agreement.status].variant} className="gap-1">
            {statusConfig[agreement.status].icon}
            {statusConfig[agreement.status].label}
          </Badge>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-160px)]">
          <AgreementPreview
            agreement={agreement}
            currentUserRole={currentUserRole}
            currentUserId={currentUserId}
            onSign={onSign}
            onDownload={onDownload}
            onPrint={onPrint}
            onReject={onReject}
            showActions={false}
          />
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {agreement.pdfUrl && (
            <Button onClick={() => onDownload?.(agreement.id)}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AgreementListItem({
  agreement,
  onClick,
}: {
  agreement: AgreementData;
  onClick?: () => void;
}) {
  const config = statusConfig[agreement.status];

  return (
    <Card className={cn('transition-colors', onClick && 'cursor-pointer hover:shadow-md', 'group')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-heading font-semibold truncate" style={{ color: 'var(--text)' }}>
                {agreement.property.title}
              </h4>
              <Badge variant={config.variant} className="gap-1 flex-shrink-0">
                {config.icon}
                {config.label}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--muted)' }}>
              <span className="truncate">{agreement.property.address}, {agreement.property.city}</span>
              <span>{typeLabels[agreement.type]}</span>
              <span>Ref: <code className="font-mono">{agreement.reference}</code></span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {(agreement.terms.rentAmount || agreement.terms.salePrice) && (
              <span className="font-heading font-bold text-lg" style={{ color: 'var(--accent)' }}>
                {formatCurrency(agreement.terms.rentAmount || agreement.terms.salePrice!)}
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {formatRelativeTime(agreement.updatedAt)}
            </span>
          </div>
        </div>

        {agreement.status !== 'fully_signed' && agreement.status !== 'terminated' && agreement.status !== 'expired' && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--muted)' }}>
              {agreement.signatures.landlord ? (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Check className="h-3.5 w-3.5" /> Landlord signed
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" /> Landlord pending
                </span>
              )}
              {agreement.signatures.tenant ? (
                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Check className="h-3.5 w-3.5" /> Tenant signed
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" /> Tenant pending
                </span>
              )}
            </div>
            {onClick && (
              <Button variant="ghost" size="sm" onClick={onClick}>
                View Details
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}