'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type TransactionStatus =
  | 'pending'
  | 'in_escrow'
  | 'released'
  | 'completed'
  | 'failed'
  | 'refunded';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

const statusConfig: Record<
  TransactionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  in_escrow: {
    label: 'In Escrow',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  released: {
    label: 'Released',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
};

export function TransactionStatusBadge({
  status,
  className
}: TransactionStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
