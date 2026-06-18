'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, User, Calendar } from 'lucide-react';
import { useTicketStatusConfig, useTicketPriorityConfig } from '@/hooks/useOrganizationTickets';

interface TicketCardProps {
  ticket: {
    id: string;
    title: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
    listing?: {
      id: string;
      title: string;
    } | null;
    assignedToUser?: {
      id: string;
      fullName: string;
    } | null;
  };
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const statusConfig = useTicketStatusConfig();
  const priorityConfig = useTicketPriorityConfig();

  const status = statusConfig[ticket.status as keyof typeof statusConfig];
  const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig];

  return (
    <Card
      className="bg-white cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm line-clamp-2">{ticket.title}</h4>
          {priority && (
            <Badge variant={priority.variant} className="ml-2 shrink-0">
              {priority.label}
            </Badge>
          )}
        </div>

        {ticket.listing && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {ticket.listing.title}
          </p>
        )}

        {ticket.assignedToUser && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {ticket.assignedToUser.fullName}
          </p>
        )}

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(ticket.createdAt).toLocaleDateString()}
        </p>

        {status && (
          <Badge variant={status.variant} className="text-xs">
            {status.label}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
