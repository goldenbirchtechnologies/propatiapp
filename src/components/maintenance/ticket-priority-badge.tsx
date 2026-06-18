'use client';

import { Badge } from '@/components/ui/badge';
import { useTicketPriorityConfig } from '@/hooks/useOrganizationTickets';

interface TicketPriorityBadgeProps {
  priority: string;
  className?: string;
}

export function TicketPriorityBadge({ priority, className }: TicketPriorityBadgeProps) {
  const priorityConfig = useTicketPriorityConfig();
  const config = priorityConfig[priority as keyof typeof priorityConfig];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {priority}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
