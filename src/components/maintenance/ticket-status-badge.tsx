'use client';

import { Badge } from '@/components/ui/badge';
import { useTicketStatusConfig } from '@/hooks/useOrganizationTickets';

interface TicketStatusBadgeProps {
  status: string;
  className?: string;
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const statusConfig = useTicketStatusConfig();
  const config = statusConfig[status as keyof typeof statusConfig];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
