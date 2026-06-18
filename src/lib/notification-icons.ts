import {
  ShieldCheck,
  FileText,
  DollarSign,
  MessageSquare,
  Wrench,
  Calendar,
  Flag,
  Bell,
  AlertCircle
} from 'lucide-react';

export function getNotificationIcon(type: string) {
  const icons: Record<string, typeof Bell> = {
    verification_submitted: ShieldCheck,
    verification_approved: ShieldCheck,
    verification_rejected: ShieldCheck,
    verification_completed: ShieldCheck,
    agreement_created: FileText,
    agreement_signed: FileText,
    agreement_pending: FileText,
    agreement_completed: FileText,
    payment_received: DollarSign,
    payment_pending: DollarSign,
    payment_failed: DollarSign,
    rent_due: Calendar,
    rent_overdue: Calendar,
    inspection_scheduled: Wrench,
    inspection_completed: Wrench,
    message_received: MessageSquare,
    message_new: MessageSquare,
    listing_flagged: Flag,
    listing_approved: Flag,
    listing_rejected: Flag,
    maintenance_ticket_created: Wrench,
    maintenance_ticket_resolved: Wrench,
    screening_completed: ShieldCheck,
    screening_pending: ShieldCheck,
    system_alert: AlertCircle,
    system_update: Bell,
  };

  return icons[type] || Bell;
}

export function getNotificationColor(type: string): string {
  const colors: Record<string, string> = {
    verification_approved: 'text-green-500',
    verification_rejected: 'text-red-500',
    verification_completed: 'text-green-500',
    payment_received: 'text-green-500',
    payment_failed: 'text-red-500',
    rent_due: 'text-amber-500',
    rent_overdue: 'text-red-500',
    listing_flagged: 'text-red-500',
    listing_approved: 'text-green-500',
    listing_rejected: 'text-red-500',
    agreement_completed: 'text-green-500',
    maintenance_ticket_resolved: 'text-green-500',
    screening_completed: 'text-green-500',
    system_alert: 'text-red-500',
  };

  return colors[type] || 'text-blue-500';
}

export function getNotificationBgColor(type: string): string {
  const colors: Record<string, string> = {
    verification_approved: 'bg-green-50',
    verification_rejected: 'bg-red-50',
    verification_completed: 'bg-green-50',
    payment_received: 'bg-green-50',
    payment_failed: 'bg-red-50',
    rent_due: 'bg-amber-50',
    rent_overdue: 'bg-red-50',
    listing_flagged: 'bg-red-50',
    listing_approved: 'bg-green-50',
    listing_rejected: 'bg-red-50',
    agreement_completed: 'bg-green-50',
    maintenance_ticket_resolved: 'bg-green-50',
    screening_completed: 'bg-green-50',
    system_alert: 'bg-red-50',
  };

  return colors[type] || 'bg-blue-50';
}
