import { Badge } from '@/components/ui/badge';

type AgreementStatus =
  | 'draft'
  | 'pending_landlord'
  | 'pending_tenant'
  | 'tenant_signed'
  | 'landlord_signed'
  | 'fully_signed'
  | 'active'
  | 'expired'
  | 'terminated';

interface AgreementStatusBadgeProps {
  status: AgreementStatus;
  className?: string;
}

const statusConfig: Record<
  AgreementStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }
> = {
  draft: {
    label: 'Draft',
    variant: 'secondary',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  pending_landlord: {
    label: 'Pending Landlord',
    variant: 'outline',
    color: 'bg-amber-50 text-amber-700 border-amber-300',
  },
  pending_tenant: {
    label: 'Pending Tenant',
    variant: 'outline',
    color: 'bg-amber-50 text-amber-700 border-amber-300',
  },
  tenant_signed: {
    label: 'Tenant Signed',
    variant: 'outline',
    color: 'bg-blue-50 text-blue-700 border-blue-300',
  },
  landlord_signed: {
    label: 'Landlord Signed',
    variant: 'outline',
    color: 'bg-blue-50 text-blue-700 border-blue-300',
  },
  fully_signed: {
    label: 'Fully Signed',
    variant: 'default',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  active: {
    label: 'Active',
    variant: 'default',
    color: 'bg-green-100 text-green-800 border-green-300',
  },
  expired: {
    label: 'Expired',
    variant: 'destructive',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  terminated: {
    label: 'Terminated',
    variant: 'destructive',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
};

export function AgreementStatusBadge({ status, className }: AgreementStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge variant="outline" className={`${config.color} border ${className || ''}`}>
      {config.label}
    </Badge>
  );
}
